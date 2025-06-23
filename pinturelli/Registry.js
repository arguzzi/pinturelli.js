import { testMode } from "./debug/_allModesFlags.js";
import validate from "./debug/testMode/validateRegistry.js";

import flag from "./debug/_allModesFlags.js";
import apiErrors from "./debug/apiErrors/registry.js";
import checkpoints from "./debug/_checkpoints.js";

import createGlobal from "./global/createGlobal.js";
import getStateManagers from "./ui/getStateManagers.js";
import UiGestures from "./ui/UiGestures.js";
import UiClasses from "./ui/UiClasses.js";
import selector from "./debug/apiErrors/selector.js";

////////////////////////////
//
export default class Registry {

	// singleton pattern
  static #singletonKey = Symbol();
	static #firstInstance = null;

  // default values
  static #singletonConfig = new Map([
    ["maxBatch", 10000],
    ["maxDeep", 50],
  ]);
  
  // dependencies
  #createGlobal = null;
  #getStateManagers = null;
  #UiGestures = null;
  #UiClasses = null;

	// main memory
	#allGlobalsByRootId = new Map(); // [[rootId: GLOBAL], [rootId: GLOBAL] ...]
	#allNodesByRootId = new Map(); // [[rootId: Map[[nodeId: node] ...]] ...]
  #allRootsIdsByNodeId = new Map(); // [[nodeId: rootId], [nodeId: rootId] ...]
	#allFollowersByNodeId = new Map(); // [[nodeId: Set[nodeId, nodeId, ...]] ...]
  #initializedRootIds = new Set(); // [rootId, rootId, ...]

	// garbage collector
  #treesToSearchDeadIds = new Set(); // [rootId, rootId, ...]
  #followersIdsToClean = new Map(); // [[nodeId: node], [nodeId: node], ...]
  #cleanupLogger = new FinalizationRegistry(({ rootId, nodeId }) => {
    checkpoints.cleanupEnded(rootId, nodeId);
  });

	//____________
  // will be freezed!!!
	constructor(privateKey) {
    if (testMode) validate.constructorCall(Registry.#singletonKey, privateKey);

    this.#createGlobal = createGlobal;
    this.#getStateManagers = getStateManagers;
    this.#UiGestures = UiGestures;
    this.#UiClasses = UiClasses;
	}

	//____________
  static _getSingleton() {
    if (Registry.#firstInstance) return Registry.#firstInstance; // <--singleton
    Registry.#firstInstance = new Registry(Registry.#singletonKey);
    return Object.freeze(Registry.#firstInstance);
  }

	//____________
  // API Config
  _pinturelliConfig(configs) {

    // getter
    if (!configs) {
      const configObject = Object.fromEntries(Registry.#singletonConfig);
      return structuredClone(configObject);
    }

    // setter
    if (flag.err) apiErrors.configFormat(Registry.#singletonConfig, configs);
    for (const [key, value] of Object.entries(configs)) {
      try {
        const clonedValue = structuredClone(value);
        Registry.#singletonConfig.set(key, clonedValue);
      } catch (error) {
        // see "the structured clone algorithm" in "mdn web docs"
        if (flag.err) apiErrors.configCloning(key, value, error);
      }
    }
  }

	//____________
  // API Root
	#allNodesProxyCreator(rootId) {
		const originalAllNodes = this.#allNodesByRootId.get(rootId);
    if (testMode) validate.allNodesProxyCreator(originalAllNodes, rootId);

		return {

      // only returns nodes from this root
      // if no id found, schedule to clean it
			get: (id, caller) => {
				const node = originalAllNodes.get(id);
        if (!node) {
          if (!caller) return null;
          this.#followersIdsToClean.set(caller.nodeId, caller);
          return null;
        }
        return node;
			},

      // prevent modification
			set: (key, value) => {
        if (flag.err) apiErrors.allNodesMutation(rootId, key, value);
        return null
      },

      // only check nodes from this root
			has: id => {
				return originalAllNodes.has(id);
			},

      // total nodes in the tree
      getSize: () => {
        return originalAllNodes.size - 1; // allNodes - root mirror
      },

      // used by assets loading
      _riskyForEach: callback => {
        for (const [nodeId, node] of originalAllNodes) {
          if (nodeId === "_") continue; // root mirror
          callback(node, nodeId, originalAllNodes);
        }
      }
    }
	}

	//____________
  // API Root
	#initializeTree(rootId) {
    if (this.#initializedRootIds.has(rootId)) return;
    this.#initializedRootIds.add(rootId); // memory update. control

    // utility
    const handleArgs = args => {
      const [ json_selector, ...restArgs ] = args;
      return [ JSON.parse(json_selector), ...restArgs ];
    }

		// eager loaded (from seeds to nodes)
    const allNodes = this.#allNodesByRootId.get(rootId);
    for (const [nodeId, seed] of allNodes) {
      if (nodeId.startsWith("_")) continue; // root cases
			const node = this.#createNode(seed); // NEW!
			seed.listened.forEach(args => node.listen(...handleArgs(args)));
			seed.listenedGroup.forEach(args => node.listenGroup(...handleArgs(args)));
      allNodes.set(nodeId, node); // memory update. overwrites seed
		}

		// relations validation and completed log
    if (flag.err) apiErrors.treeStructure(allNodes);
    if (flag.log) checkpoints.treeInitialized(rootId, true, allNodes);
	}

	//____________
  // API Root
  _pinturelliRoot(description) {
		const rootCount = this.#allGlobalsByRootId.size;
		const rootId = description.customRootId ?? `_root_${rootCount}`;  /* (A) */

		// default placeholder
    const newDescription = { 
      containerId: null,                                               /* (B) */
      resolutionX: 540,                                                /* (C) */
      resolutionY: null,                                               /* (D) */
      proportion: null,                                                /* (E) */
      q5NoAlphaMode: false,                                            /* (F) */
      q5PixelatedMode: false,                                          /* (G) */
      q5PixelDensity: 1,                                               /* (H) */
      q5MaxFrameRate: 60,                                              /* (I) */
      nodesTracker: [],                                                /* (J) */
      eventsTracker: [],                                               /* (K) */
      memoryTracker: ["ALL_NODES"],                                    /* (L) */
      treeAssets: [],                                                  /* (M) */
      sketchSetup: [],                                                 /* (N) */

			// overwrites placeholder
      ...description,
			rootCount,
      rootId,
      nodeId: rootId,
      _nodeUUID: crypto.randomUUID(), // internal use only
      _getFollowerIds: () => new Set(this.#allFollowersByNodeId.get(rootId)),
      _forceIdsCleaner: () => this.#treesToSearchDeadIds.add(rootId),
      _maintenanceTasks: () => this.#runMaintenanceTasks(),
    }

    // types and format validation
		if (flag.err) apiErrors.newRoot(this.#allGlobalsByRootId, newDescription);
    
    // memory update pt1
    this.#allNodesByRootId.set(rootId, new Map()); // (1/5)
    this.#allRootsIdsByNodeId.set(rootId, rootId); // (2/5)
		this.#allFollowersByNodeId.set(rootId, new Set()); // (3/5)
    
    // global object dependencies
		const dependencies = {
      ALL_NODES: this.#allNodesProxyCreator(rootId),
      SELECT_ALL: path => this._pinturelliRiskySelectAll(path),
		  treeInitializer: () => this.#initializeTree(rootId),
      registryKey: Registry.#singletonKey,
    }

    // new global object
		const GLOBAL = this.#createGlobal(dependencies, newDescription);

    // memory update pt2
    const root = GLOBAL.UI_ROOT;
    this.#allNodesByRootId.get(rootId).set(rootId, root); // (4a/5) root
    this.#allNodesByRootId.get(rootId).set("_", root); // (4b/5) root mirror
		this.#allGlobalsByRootId.set(rootId, GLOBAL); // (5/5)

    // checkpoint
    if (flag.log) {
      const isTracked = newDescription.memoryTracker.includes("GLOBAL");
      checkpoints.newRootCreated(rootId, isTracked, GLOBAL);
    }

    // response (API Root)
    return root;
	}
  
	//____________
  // API Node
	_pinturelliNode(description) {
    const allNodesByRootId = this.#allNodesByRootId;

    // normalized nodeId
    const nodeUUID = crypto.randomUUID();
    const nodeId = description.nodeId ?? "#randomId_" + nodeUUID;

    // handle clone case (single-recursion and early return)
    const isClone = description._clonationKey === Registry.#singletonKey;
    if (isClone) {
      if (flag.err) apiErrors.newClone(allNodesByRootId, description, nodeId);
      // check if cloneId is repeated <--pending!!!!!
      const finalId = 0; // <--pending!!!!!
      const finalDescription = {
        ...description,
        nodeId: finalId,
        _clonationKey: null, // recursion base case. not clone case again
      }
      return this._pinturelliNode(finalDescription); // recursion!!!
    }

    // normalized description
    if (flag.err) apiErrors.newNode(allNodesByRootId, description, nodeId);
    const {
      state = {}, // spreads in initialState
      _clonationKey: _, // deleted from description
      ...inmutableDescription // no state, no clonationKey
    } = description;

    // state: default placeholder
    const initialState = {
      followingId: description.rootId,                                  /* 00 */
      labels: [],                                                       /* 01 */
      left: 0,                                                          /* 02 */
      right: null,                                                      /* 03 */
      top: 0,                                                           /* 04 */
      bottom: null,                                                     /* 05 */
      width: 100,                                                       /* 06 */
      height: 150,                                                      /* 07 */
      proportion: null,                                                 /* 08 */
      offsetX: 0,                                                       /* 09 */
      offsetY: 0,                                                       /* 10 */
      nodeLayer: 0,                                                     /* 11 */
      treeLayer: 0,                                                     /* 12 */
      insideLayer: 0,                                                   /* 13 */
      nodeVisibility: true,                                             /* 14 */
      treeVisibility: true,                                             /* 15 */
      layerVisibility: true,                                            /* 16 */
      painting: null,                                                   /* 17 */
      overlayedPainting: null,                                          /* 18 */
      storeBuffer: false,                                               /* 19 */
      centerMatrix: false,                                              /* 20 */
      ...state, // overwrites placeholder
    }
    
    // relations: memory update
    const { rootId } = inmutableDescription;
    const { followingId } = initialState;
    const allFollowersByNodeId = this.#allFollowersByNodeId;
    this.#allRootsIdsByNodeId.set(nodeId, rootId);
    const hasFollowers = allFollowersByNodeId.has(nodeId);
    if (!hasFollowers) allFollowersByNodeId.set(nodeId, new Set());
    const equalsFollowers = allFollowersByNodeId.get(followingId);
    if (equalsFollowers) equalsFollowers.add(nodeId);
    else allFollowersByNodeId.set(followingId, new Set([nodeId]));

    // relations: getter
    const _getFollowerIds = () => new Set(allFollowersByNodeId.get(nodeId));

    // creation: any case
    const basicDescription = {
      UiClass: "/Block",
      UiGestures: [],
      nodeAssets: {},
      paintings: {},
			...inmutableDescription, // without state and clonationKey
      nodeId, // random if initial was nullish. clone case handled
      _nodeUUID: nodeUUID, // internal use only
      _initialState: initialState, // default + custom state
    }

		// creation: lazy loaded case (after initialization)
		if (this.#initializedRootIds.has(rootId)) {
      return this.#createNode({ ...basicDescription, _getFollowerIds });
    }

		// creation: eager loaded case (before initialization)
    const { listened, listenedGroup } = description;
    const isArray = Array.isArray;
    const seed_listened = isArray(listened) ? [...listened] : [];
    const seed_listenedGroup = isArray(listenedGroup) ? [...listenedGroup] : [];
    const handleListening = (args, seed_targetList) => {
      const { selector, restArgs } = args;
      try {
        const json_selector = JSON.stringify(selector);
        seed_targetList.push(json_selector, ...restArgs);
      } catch (error) {
        if (flag.err) apiErrors.n.listenSelector(selector, nodeId, error);
      }
    }
    const seed_listen = (...args) => {
      handleListening(args, seed_listened);
    }
    const seed_listenGroup = (...args) => {
      handleListening(args, seed_listenedGroup);
    }
    const handleStop = (selector, message, seed_targetList) => {
      for (let i = seed_targetList.length - 1; i >= 0; i--) {
        const seed_memoryArgs = seed_targetList[i];
        if (!Array.isArray(seed_memoryArgs) || seed_memoryArgs.length === 0) {
          seed_targetList.splice(i, 1);
          continue;
        }
        const [ json_selector, seed_message ] = seed_memoryArgs;
        try {
          const json_arg = JSON.stringify(selector);
          const matchSelector = !json_selector || (json_selector === json_arg);
          const matchMessage = !seed_message || (seed_message === message);
          const hasNoMessage = !message;
          if (matchSelector && (matchMessage || hasNoMessage)) {
            seed_targetList.splice(i, 1);
          }
        } catch (error) {
          if (flag.err) apiErrors.n.listenSelector(selector, nodeId, error);
        }
      }
    }
    const seed_stopListening = (singleSelector, message) => {
      handleStop(singleSelector, message, seed_listened);
    }
    const seed_stopListeningGroup = (groupSelector, message) => {
      handleStop(groupSelector, message, seed_listenedGroup);
    }

    // node simulation
    const seed = Object.freeze({
      ...basicDescription,

      // seed temporary memory (mutation expected via closures)
      state: initialState, 
      listened: seed_listened,
      listenedGroup: seed_listenedGroup,
      
      // api simulation (temporary closures)
			listen: seed_listen, // setter
			listenGroup: seed_listenGroup, // setter
      stopListening: seed_stopListening, // setter
      stopListeningGroup: seed_stopListeningGroup, // setter
      _getFollowerIds, // getter (not temporary, Registry closure)
      _getRawState: key => initialState[key], // getter
      _patchRawState: (key, value) => { initialState[key] = value }, // setter
      _getRawOutput: () => {}, // useless (just for compability)
      _patchRawOutput: () => {}, // useless (just for compability)
      _removeReferences: () => {}, // useless (just for compability)
			_getCloneDescription: () => ({ // getter
        ...basicDescription,
        _listened: seed_listened.map(args => [...args]),
        _listenedGroup: seed_listenedGroup.map(args => [...args]),
      }),
		});
    
		allNodesByRootId.get(rootId).set(nodeId, seed); // untill initialization
		return seed; // response (API Node) eager: access point for closures
	}

	//____________
  // API Node
	#createNode(description) {
    const { nodeId, rootId } = description;
    if (nodeId.startsWith("_")) return; // root cases

    const GLOBAL = this.#allGlobalsByRootId.get(rootId);
    const dependencies = {
      UI_ROOT: GLOBAL.UI_ROOT,
      ALL_NODES: GLOBAL.ALL_NODES,
      SELECT_ALL: GLOBAL.SELECT_ALL,
      EVENT_BUS: GLOBAL.EVENT_BUS,
      DISPATCHER: GLOBAL.DISPATCHER,
      CAT_PAINTER: GLOBAL.CAT_PAINTER,
      getStateManagers: this.#getStateManagers,
      UiGestures: this.#UiGestures,
      registryKey: Registry.#singletonKey,
    }
    
		// node: UiClass extends UiCore (composite pattern)
		const UiClass = this.#UiClasses[description.UiClass.slice(1)];
		const node = Object.freeze(new UiClass(dependencies, description)); // NEW!
		this.#allNodesByRootId.get(rootId).set(nodeId, node);

    // response (API Node) lazy: real node
		return node;
	}

	//____________
  // API Select
  #originParsers = {

    // origin: rootId
    "_": path => {
      const matched = path.match(/^_([a-zA-Z][A-Za-z0-9_-]*)/);
      if (flag.err && !matched?.[1]) apiErrors.s.syntax(path, "rootId", "_");
      const root = this.#allGlobalsByRootId.get(matched[1])?.UI_ROOT;
      if (flag.err && !root) apiErrors.s.unknown("rootId", matched[1]);
      return {
        newPath: path.slice(matched[0].length).trim(),
        newSelected: [ root ],
      }
    },

    // origin: nodeId
    "#": path => {
      const matched = path.match(/^#([a-zA-Z][A-Za-z0-9_-]*)/);
      if (flag.err && !matched?.[1]) apiErrors.s.syntax(path, "nodeId", "#");
      const nodeId = matched[1];
      const rootId = this.#allRootsIdsByNodeId.get(nodeId);
      if (flag.err && !rootId) apiErrors.s.unknown("rootId", nodeId);
      const allNodes = this.#allNodesByRootId.get(rootId);
      if (flag.err && !allNodes) apiErrors.s.unknown("allNodesByRoot", rootId);
      const node = allNodes.get(nodeId);
      if (flag.err && !node) apiErrors.s.unknown("node", nodeId);
      return {
        newPath: path.slice(matched[0].length).trim(),
        newSelected: [ node ],
      }
    }
  }

	//____________
  // API Select
	#originSelector(rawPath) {
    if (flag.err) apiErrors.s.pathFormat(rawPath);
    const path = rawPath.trim();
    const parser = this.#originParsers[path[0]];
    if (flag.err && !parser) apiErrors.s.unknownPrefix(path);
    return parser(path);
  }
  
	//____________
  // API Select
  #accumulativeParsers = {

    // group: followers of this node
    ">": (path, selected, targetMap) => {
      const newPath = path.slice(1).trim();
      const newSelected = [];
      for (const node of selected) {
        const followerIds =  node._getFollowerIds();
        for (const followerId of followerIds) {
          const follower = targetMap.get(followerId);
          if (!follower) continue;
          newSelected.push(follower);
        }
      }
      return { newPath, newSelected };
    },

    // group: followed by this node
    "<": (path, selected, targetMap) => {
      const newPath = path.slice(1).trim();
      const newSelected = [];
      const addedIds = new Set();
      for (const node of selected) {
        const followingId = node._getRawState("followingId");
        if (followingId === "ARGUZZI") {
          if (flag.err) apiErrors.s.beyondRoot(path, node);
          continue;
        }
        if (addedIds.has(followingId)) continue;
        addedIds.add(followingId);
        const following = targetMap.get(followingId);
        if (flag.err && !following) apiErrors.s.notSubtree(node, followingId);
        newSelected.push(following);
      }
      return { newPath, newSelected };
    },

    // group: equals (followers of followed node)
    "~": (path, selected, targetMap) => {
      const newPath = path.slice(1).trim();
      const newSelected = [];
      const addedIds = new Set();
      for (const node of selected) {
        const followingId = node._getRawState("followingId");
        if (followingId === "ARGUZZI") {
          if (flag.err) apiErrors.s.beyondRoot(path, node);
          continue;
        }
        if (addedIds.has(followingId)) continue;
        addedIds.add(followingId);
        const following = targetMap.get(followingId);
        if (flag.err && !following) apiErrors.s.notSubtree(node, followingId);
        for (const followerId of following._getFollowerIds()) {
          if (addedIds.has(followerId)) continue;
          addedIds.add(followerId);
          const follower = targetMap.get(followerId);
          if (!follower) continue;
          newSelected.push(follower);
        }
      }
      return { newPath, newSelected };
    },

    // group: subtree (all followers, recursively)
    "*": (path, selected, targetMap) => {
      const stop = {
        maxBatch: Registry.#singletonConfig.get("maxBatch"),
        maxDeep: Registry.#singletonConfig.get("maxDeep"),
      }
      const addedIds = new Set();
      const newPath = path.slice(1).trim();
      const newSelected = [];
      const goDeeper = (acc, node, actualDeep) => {
        if (flag.err) {
          if (actualDeep > stop.maxDeep) {
            apiErrors.s.iterationDeep(stop.maxDeep, newPath);
          }
          if (acc.length > stop.maxBatch) {
            apiErrors.s.iterationPatch(stop.maxBatch, newPath);
          }
        }
        const { nodeId } = node;
        if (addedIds.has(nodeId)) return;
        addedIds.add(nodeId);
        acc.push(node); // depth-first traversal (dfs), pre-order variant
        for (const followerId of node._getFollowerIds()) {
          const follower = targetMap.get(followerId);
          if (follower) goDeeper(acc, follower, actualDeep + 1); // recursion!!!
          else this.#followersIdsToClean.set(nodeId, node);
        }
      };
      for (const node of selected) {
        goDeeper(newSelected, node, 0);
      }
      return { newPath, newSelected };
    },

    // filter: label (always kebab-case)
    ".": (path, selected) => {
      const matched = path.match(/^\.([a-z][a-z0-9_-]*)/);
      if (flag.err && !matched?.[1]) apiErrors.s.syntax(path, "label", ".");
      const label = matched[1];
      const newPath = path.slice(matched[0].length).trim();
      const newSelected = [];
      for (const node of selected) {
        if (node._getRawState("labels").includes(label)) {
          newSelected.push(node);
        }
      }
      return { newPath, newSelected };
    },

    // filter: UiClass (always PascalCase)
    "/": (path, selected) => {
      const matched = path.match(/^\/([A-Z][A-Za-z0-9_-]*)/);
      if (flag.err && !matched?.[1]) apiErrors.s.syntax(path, "UiClass", "/");
      const className = matched[1];
      const newPath = path.slice(matched[0].length).trim();
      const newSelected = [];
      for (const node of selected) {
        if (node.UiClass === className) {
          newSelected.push(node);
        }
      }
      return { newPath, newSelected };
    },

    // filter: UiGesture (always UPPER_CASE)
    "%": (path, selected) => {
      const matched = path.match(/^%([A-Z][A-Z0-9_-]*)/);
      if (flag.err && !matched?.[1]) apiErrors.s.syntax(path, "UiGesture", "%");
      const gesture = matched[1];
      const newPath = path.slice(matched[0].length).trim();
      const newSelected = [];
      for (const node of selected) {
        if (node.UiGestures.includes(gesture)) {
          newSelected.push(node);
        }
      }
      return { newPath, newSelected };
    }
  }
  
	//____________
  // API Select
	#accumulativeSelector(accumulator, onlyFirst) {
    const originsRootId = accumulator.newSelected[0].rootId;
    const targetMap = this.#allNodesByRootId.get(originsRootId);
    const stop = {
      actualDeep: 0,
      maxBatch: Registry.#singletonConfig.get("maxBatch"),
      maxDeep: Registry.#singletonConfig.get("maxDeep"),
    }

    // iteration control (path)
    while (accumulator.newPath.length > 0) {
      stop.actualDeep++;

      // process
      const { newPath: lastPath, newSelected: lastSelected } = accumulator;
      const parser = this.#accumulativeParsers?.[lastPath[0]];
      if (flag.err && !parser) apiErrors.s.unknownPrefix(lastPath);
      accumulator = parser(lastPath, lastSelected, targetMap); // mutation!!!
      
      // iteration control (selected)
      if (accumulator.newSelected.length === 0) break;

      // only first
      const { newPath, newSelected } = accumulator;
      if (onlyFirst) accumulator.newSelected = [newSelected[0]]; // mutation!!!

      // iteration safe limits
      if (stop.actualDeep > stop.maxDeep) {
        if (flag.err) apiErrors.s.iterationDeep(stop.maxDeep, newPath);
        if (flag.log) checkpoints.unsafeIteration(newPath, accumulator, stop);
      }
      if (newSelected.length > stop.maxBatch) {
        if (flag.err) apiErrors.s.iterationPatch(stop.maxBatch, newPath);
        if (flag.log) checkpoints.unsafeIteration(newPath, accumulator, stop);
      }
    }

    // output
    if (onlyFirst) return accumulator.newSelected[0];
    return accumulator.newSelected;
	}

	//____________
  // API Select
	_pinturelliRiskySelect(path) {
    const origin = this.#originSelector(path);
    if (origin.newPath.length === 0) return origin.newSelected[0];
    return this.#accumulativeSelector(origin, true);
	}

	//____________
  // API Select
	_pinturelliRiskySelectAll(path) {
    const origin = this.#originSelector(path);
    if (origin.newPath.length === 0) return origin.newSelected;
    return this.#accumulativeSelector(origin, false);
	}

	//____________
  // API Clone
  _pinturelliClone(path, description = {}) {
    const node = this._pinturelliRiskySelect(path);
    if (!node) return null;
    const cloneDescription = node._getCloneDescription();
    const cloneId = description.nodeId ?? `${node.nodeId}_1-of-1-clone_`;
    const _clonationKey = Registry.#singletonKey;
    const newDescription = { ...cloneDescription, cloneId, _clonationKey };
    return this._pinturelliNode(newDescription);
  }

	//____________
  // API Clone
  _pinturelliCloneAll(path, description = {}) {
    const nodes = this._pinturelliRiskySelectAll(path);
    if (!nodes?.[0]) return [];
    const totalClones = nodes.length;
    const customId = description.nodeId;
    return nodes.map((node, index) => {
      const cloneDescription = node._getCloneDescription();
      const baseId = customId ? `${customId}` : `${node.nodeId}`;
      const cloneId = baseId + `_${index + 1}-of-${totalClones}-clone_`;
      const _clonationKey = Registry.#singletonKey;
      const newDescription = { ...cloneDescription, cloneId, _clonationKey };
      return this._pinturelliNode(newDescription); 
    });
  }

	//____________
  // API Destroy
	#recursiveDestroyer(targetMap, nodeId) {

    // depth-first traversal (dfs), post-order variant
		for (const followerId of this.#allFollowersByNodeId.get(nodeId)) {
			this.#recursiveDestroyer(targetMap, followerId); // recursion!!!
		}

    // memory update
		this.#allFollowersByNodeId.delete(nodeId);
    this.#allRootsIdsByNodeId.delete(nodeId);
		targetMap.get(nodeId)._removeReferences(Registry.#singletonKey);
		targetMap.delete(nodeId);
	}

	//____________
  // API Destroy
	_pinturelliRiskyDestroy(path) {
    const target = this._pinturelliRiskySelect(path);
    if (!target) {
      if (flag.err) apiErrors.destroyPath(path);
      if (flag.log) checkpoints.missingNode("Registry", path);
      return;
    }
    
    // garbage collector log
    const { rootId, nodeId } = target;
    if (flag.log) this.#cleanupLogger.register(target, {rootId, nodeId});

    // root case
		if (nodeId.startsWith("_")) {

      // depth-first traversal (dfs), post-order variant
			for (const followerId of this.#allFollowersByNodeId.get(rootId)) {
				this._pinturelliRiskyDestroy(followerId); // recursion!!!
			}

      // memory update
      this.#initializedRootIds.delete(rootId);
			this.#allFollowersByNodeId.delete(rootId);
      this.#allRootsIdsByNodeId.delete(rootId);
      target._removeReferences(Registry.#singletonKey);
      this.#allNodesByRootId.delete(rootId);
			this.#allGlobalsByRootId.delete(rootId);
			return;
		}

    // seed/node case
    const targetMap = this.#allNodesByRootId.get(rootId);
		this.#recursiveDestroyer(targetMap, nodeId);
	}

	//____________
  // API Destroy
	_pinturelliRiskyDestroyAll(path) {
		const nodes = this._pinturelliRiskySelectAll(path);
		for (const node of nodes) {
			this._pinturelliRiskyDestroy(node.nodeId);
		}
	}

  //____________
  #runMaintenanceTasks() {

    // 0: force search for dead ids
    for (const rootId of this.#treesToSearchDeadIds) {
      this._pinturelliRiskySelectAll(`${rootId} *`);
    }

    // 1: clean dead following ids
    for (const [callerId, caller] of this.#followersIdsToClean) {
      const targetMap = this.#allNodesByRootId.get(caller.rootId);
      const allFollowersSet = this.#allFollowersByNodeId.get(callerId);
      for (const followingId of caller._getFollowerIds()) {
        if (targetMap.has(followingId)) continue;

        // memory update
        allFollowersSet.delete(followingId);
        this.#allRootsIdsByNodeId.delete(followingId);
      }
    }

    // 2: event bus
    // 3: dispatcher
    // 4: painter

    // Z: clear all tasks
    this.#treesToSearchDeadIds.clear();
    this.#followersIdsToClean.clear();
  }
}
