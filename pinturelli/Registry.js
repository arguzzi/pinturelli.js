import { devMode } from "./debug/_allModesFlags.js";
import validate from "./debug/devMode/validateRegistry.js";

import flag from "./debug/_allModesFlags.js";
import apiErrors from "./debug/apiErrors/registry.js";
import checkpoints from "./debug/_checkpoints.js";

////////////////////////////
//
export default class Registry {

	// singleton pattern
  static #privateKey = Symbol();
	static #firstInstance = null;

	// dependencies
	#createGlobal = null;
  #stateManagers = null;
  #UiGestures = null;
	#UiClasses = null;

	// main memory
	#allRoots = new Map(); // [[rootId: GLOBAL], [rootId: GLOBAL] ...]
	#allNodesByRoot = new Map(); // [[rootId: new Map([[nodeId: node] ...])] ...]
  #allRootsIdsByNodeId = new Map(); // [[nodeId: rootId], [nodeId: rootId] ...]
	#allFollowers = new Map(); // [[nodeId: new Set([nodeId, nodeId, ...])] ...]
	#wereInitialized = new Set(); // [nodeId, nodeId, ...]

	// garbage collector log
  #cleanupLogger = new FinalizationRegistry(info => {
    checkpoints.cleanupEnded(info[0], info[1]); // info: [rootId, nodeId]
  });

	//____________
  // will be freezed!!!
  static getSingleton(dependencies) {
    if (devMode) validate.getSingleton(dependencies);
    if (Registry.#firstInstance) return Registry.#firstInstance;
    Registry.#firstInstance = new Registry(dependencies, Registry.#privateKey);
    return Registry.#firstInstance;
  }

	//____________
	constructor(dependencies, privateKey) {
    if (devMode) validate.constructorCall(Registry.#privateKey, privateKey);
    this.#createGlobal = dependencies.createGlobal;
    this.#stateManagers = dependencies.stateManagers;
    this.#UiGestures = dependencies.UiGestures;
		this.#UiClasses = dependencies.UiClasses;
	}

	//____________
  // API Root
	#allNodesProxyCreator(rootId) {
		const allNodes = this.#allNodesByRoot.get(rootId);
    if (devMode) validate.allNodesProxyCreator(allNodes, rootId);
		return new Proxy({}, {

      // only returns nodes from this root
			get: (_, id) => {
				return allNodes.get(id);
			},

      // prevent modification
			set: () => false,

      // only check nodes from this root
			has: (_, id) => {
				return allNodes.has(id);
			},

      // only returns ids from this root
      ownKeys: () => {
        return Array.from(allNodes.keys())
      },

      // needed by ownKeys
      getOwnPropertyDescriptor: (_, id) => {
        const node = allNodes.get(id);
        if (!node) return undefined;
        return {
          configurable: true, // *target is {} so makes no side effects
          enumerable: true,
          value: node,
          writable: false,
        }
      },
  
      // prevent modification
      defineProperty: () => false,
      deleteProperty: () => false,
      preventExtensions: () => false,
		});
	}

	//____________
  // API Root
  pinturelliRoot(description) {
		const rootCount = this.#allRoots.size + 1;
		const rootId = description?.customRootId ?? `_root_${rootCount}`; /* 00 */

		// default placeholder
    const newDescription = { 
      containerId: null,            /* 01 */
      resolutionX: 540,             /* 02 */
      resolutionY: null,            /* 03 */
      proportion: null,             /* 04 */
      q5NoAlphaMode: false,         /* 05 */
      q5PixelatedMode: false,       /* 06 */
      q5MaxFrameRate: 60,           /* 07 */
      nodesTracker: [],             /* 08 */
      eventsTracker: [],            /* 09 */
      memoryTracker: ["ALL_NODES"], /* 10 */
      globalAssets: {},             /* 11 */
      sketchSetup: [],              /* 12 */

			// overwrites placeholder
      ...description,
			rootCount,
      rootId,
      nodeId: rootId,
    }

    // types and format validation
		if (flag.err) apiErrors.rootDescription(this.#allRoots, newDescription);
    
    // memory update pt1
    this.#allNodesByRoot.set(rootId, new Map()); // (1/5)
    this.#allRootsIdsByNodeId.set(rootId, rootId); // (2/5)
		this.#allFollowers.set(rootId, new Set()); // (3/5)
    
    // global object dependencies
		const dependencies = {
      allNodes: this.#allNodesProxyCreator(rootId),
      selectAll: path => this.pinturelliRiskySelectAll(path),
		  treeInitializer: () => this.#initializeTree(rootId),
      _getFollowerIds: () => (
        Object.freeze(Array.from(this.#allFollowers.get(rootId)))
      ),
    }

    // new global object
		const GLOBAL = this.#createGlobal(dependencies, newDescription);

    // memory update pt2
    const root = GLOBAL.UI_ROOT;
    this.#allNodesByRoot.get(rootId).set("_", root); // (4a/5)
    this.#allNodesByRoot.get(rootId).set(rootId, root); // (4b/5)
		this.#allRoots.set(rootId, GLOBAL); // (5/5)

    // checkpoint
    if (flag.log) {
      const isTracked = newDescription.memoryTracker.includes("GLOBAL");
      checkpoints.newRootCreated(rootId, isTracked, GLOBAL);
    }

    // response (api root)
    return root;
	}

	//____________
  // API Node
	pinturelliNode(description) {
    const { state = {}, ...newDescription } = description;

    // default placeholder
    const newState = {
      labels: [],
      followingId: description.rootId,
      left: 0,
      right: null,
      top: 0,
      bottom: null,
      width: 100,
      height: 150,
      proportion: null,
      offsetX: 0,
      offsetY: 0,
      originX: 0,
      originY: 0,
      treeVisibility: true,
      nodeVisibility: true,
      treeLayer: 0,
      nodeLayer: 0,
      painting: "_empty",
      overlayedPainting: "_empty",
      ...state, // overwrites placeholder
    }

    // types and format validation
    if (flag.err) apiErrors.nodeDescription(this.#allNodesByRoot, description);

    // update relations
    const { rootId, nodeId } = description;
    this.#allRootsIdsByNodeId.set(nodeId, rootId);
    const hasFollowers = this.#allFollowers.has(nodeId);
    if (!hasFollowers) this.#allFollowers.set(nodeId, new Set());
    const followingId = description?.state?.followingId ?? rootId;
    const equalsFollowers = this.#allFollowers.get(followingId);
    if (equalsFollowers) equalsFollowers.add(nodeId);
    else this.#allFollowers.set(followingId, new Set([nodeId]));

    // state property
    const privateState = {
      ...newState,
      labels: newState?.labels ?? [],
      followingId,
    };

		// lazy loaded (after initialization)
		if (this.#wereInitialized.has(rootId)) {
      return this.#addNode({
        UiClass: "Block",
        UiGestures: [],
        ...newDescription, // validated id and root. no state property
        _privateState: privateState,
        _getFollowerIds: () => (
          Object.freeze(Array.from(this.#allFollowers.get(rootId)))
        ),
      });
    }

		// eager loaded (before initialization)
    const listened = []; // seed memory for primary events
    const pinturelliNode = d => this.pinturelliNode(d); // clonator
		const seed = Object.freeze({
      UiClass: "Block",
      UiGestures: [],
			...newDescription, // validated id and root. no state property
      _privateState: privateState,
      _getPublicState: key => privateState[key], // closure (read-only)
      _getFollowerIds: () => (
        Object.freeze(Array.from(this.#allFollowers.get(rootId)))
      ),
      _removeReferences: () => {}, // useless before initialization
      _listened: listened, // mutation expected via closure
			listen: (...args) => listened.push(args), // closure (setter)
			clone: overwriteDescription => pinturelliNode({ // binded registry method
        ...newDescription, state: { ...privateState }, ...overwriteDescription,
      }),
		});
    
		this.#allNodesByRoot.get(rootId).set(nodeId, seed);
		return seed; // access point for closures
	}

	//____________
  // API Node
	#addNode(description) {
    if (!description.nodeId.startsWith("#")) return;

    const GLOBAL = this.#allRoots.get(description.rootId);
    const dependencies = {
      UI_ROOT: GLOBAL.UI_ROOT,
      DISPATCHER: GLOBAL.DISPATCHER,
      EVENT_BUS: GLOBAL.EVENT_BUS,
      PAINTER: GLOBAL.PAINTER,
      stateManagers: this.#stateManagers,
      UiGestures: this.#UiGestures,
    };
    
		// UiClass extends UiCore (composite pattern)
		const UiClass = this.#UiClasses[description?.UiClass.slice(1) ?? "Block"];
		const newNode = Object.freeze(new UiClass(dependencies, description)); //<@!
		this.#allNodesByRoot.get(description.rootId).set(description.nodeId, newNode);
		return newNode;
	}
  
	//____________
  // API Node
	#initializeTree(rootId) {
    if (this.#wereInitialized.has(rootId)) return;
    this.#wereInitialized.add(rootId);

		// eager loaded nodes (from seeds to nodes)
    const allNodes = this.#allNodesByRoot.get(rootId);
    for (const [nodeId, seed] of allNodes) {
      if (!nodeId.startsWith("#")) continue;
			const newNode = this.#addNode(seed);
			seed._listened.forEach(args => newNode.listen(...args));
      allNodes.set(nodeId, newNode); // overwrite seed
		}

		// relations validation and completed log
    if (flag.log) checkpoints.treeInitialized(rootId, true, allNodes);
	}

	//____________
  // API Select
	#originSelector(path) {
    const output = {
      newPath: null,
      firstAccumulated: null,
    }

    // origin: rootId--> first char is "_"
    if (path.startsWith("_")) {
      const matched = path.match(/^_([a-z][A-Za-z0-9_]*)/);
      if (!matched?.[1]) 1_1_1 // devErrors.selectSyntax(path, "rootId", "_");
      const root = this.#allRoots.get(matched[1])?.UI_ROOT;
      if (!root) 1_1_1 // devErrors.selectOrigin(path, "root", matched[1]);
      output.newPath = path.slice(matched[0].length).trim();
      output.firstAccumulated = [ root ];
    }

    // origin: nodeId--> first char is "#" or lowercase
    else if (path.startsWith("#") || /^[a-z]/.test(path)) {
      const matched = path.match(/^#?([a-z][A-Za-z0-9_]*)/);
      if (!matched?.[1]) 1_1_1 // devErrors.selectSyntax(path, "nodeId", "#");
      const nodeId = matched[1];
      const rootId = this.#allRootsIdsByNodeId.get(nodeId);
      if (!rootId) 1_1_1 // devErrors.selectOrigin(path, "root", nodeId);
      const node = this.#allNodesByRoot.get(rootId)?.get(nodeId);
      if (!node) 1_1_1 // devErrors.selectOrigin(path, "node", nodeId);
      output.newPath = path.slice(matched[0].length).trim();
      output.firstAccumulated = [ node ];
    }
    
    // origin: unknown
    else {
      1_1_1 // devErrors.selectSyntax(path, "rootId or nodeId before anything else");
    }

    // response
    return output;
  }

	//____________
  // API Select
	#recursiveSelector(path, targetMap, accumulated, returnAll) {
    if (accumulated.length <= 0) 1_1_1 // devErrors.selectNoAccumulated(path);

    const output = {
      newPath: null,
      newAccumulated: null,
    }

    // accumulator: followers of this node--> first char is ">"
    if (path.startsWith(">")) {
      output.newPath = path.slice(1).trim();
      output.newAccumulated = accumulated.flatMap(node => 
        node._getFollowerIds().reduce((acc, followerId) => {
          const follower = targetMap.get(followerId);
          if (follower) acc.push(follower);
          return acc;
        }, [])
      );
    }

    // accumulator: followed by this node--> first char is "<"
    else if (path.startsWith("<")) {
      output.newPath = path.slice(1).trim();
      output.newAccumulated = accumulated.reduce((acc, node) => {
        const followingId = node._getPublicState("followingId");
        if (followingId === "ARGUZZI") 1_1_1 // devErrors.selectBeyondRoot(path);
        const following = targetMap.get(followingId);
        if (!acc.includes(following)) acc.push(following);
        return acc;
      }, []);
    }

    // accumulator: equals (followers of followed node)--> first char is "~"
    else if (path.startsWith("~")) {
      const addedIds = new Set();
      output.newPath = path.slice(1).trim();
      output.newAccumulated = accumulated.flatMap(node => {
        const followingId = node._getPublicState("followingId");
        if (followingId === "ARGUZZI") 1_1_1 // devErrors.selectBeyondRoot(path);
        if (addedIds.has(followingId)) return [];
        addedIds.add(followingId);
        const root = this.#allRoots.get(followingId)?.UI_ROOT;
        const followed = root ?? targetMap.get(followingId);
        return followed._getFollowerIds().reduce((acc, followerId) => {
          const follower = targetMap.get(followerId);
          if (follower) acc.push(follower);
          return acc;
        }, []);
      });
    }

    // accumulator: label--> first char is "."
		else if (path.startsWith(".")) {
      const matched = path.match(/^\.([a-z][A-Za-z0-9_-]*)/);
      if (!matched?.[1]) 1_1_1 // devErrors.selectSyntax(path, "label", ".");
      output.newPath = path.slice(matched[0].length).trim();
      output.newAccumulated = accumulated.filter(node => (
        node._getPublicState("labels").includes(matched[1])
      ));
    }

    // accumulator: gesture--> first char is "$"
		else if (path.startsWith("$")) {
      const matched = path.match(/^\$([a-z][A-Za-z0-9_]*)/);
      if (!matched?.[1]) 1_1_1 // devErrors.selectSyntax(path, "gesture", "$");
      output.newPath = path.slice(matched[0].length).trim();
      output.newAccumulated = accumulated.filter(node => (
        node.UiGestures.includes(matched[1])
      ));
    }

    // accumulator: UiClass--> first char is UPERCASE (PascalCase)
    else if (/^[A-Z]/.test(path)) {
      const matched = path.match(/^([A-Z][A-Za-z0-9_]*)/);
      if (!matched?.[1]) 1_1_1 // devErrors.selectSyntax(path, "UiClass", "");
      output.newPath = path.slice(matched[0].length).trim();
      output.newAccumulated = accumulated.filter(node => (
        node.UiClass === matched[1]
      ));
    }

    // accumulator: subtree (recursive)--> first char is "*"
    else if (path.startsWith("*")) {
      const addedIds = new Set();
      const goDeeper = (acc, node) => {
        if (addedIds.has(node.nodeId)) 1_1_1 // devErrors.loopInTree();
        addedIds.add(node.nodeId);
        acc.push(node); // depth-first traversal (dfs), preorder variant
        for (const follower of node._getFollowerIds()) {
          goDeeper(acc, follower);
        }
      }
      output.newPath = path.slice(1).trim();
      output.newAccumulated = accumulated.reduce((acc, node) => {
        goDeeper(acc, node);
        return acc;
      }, []);
    }

    // accumulator: unknown
    else {
      1_1_1 // devErrors.selectSyntax(path, "unknown prefix (not a valid accumulator)");
    }

    // linear recursion (like loop, not like tree)
    if (output.newPath.length > 0) {
      const { newPath, newAccumulated } = output; // this level local snapshot
      if (!newAccumulated?.[0]) 1_1_1 // devErrors.selectNoAccumulated(path);
      const recAccumulated = returnAll ? newAccumulated : [newAccumulated[0]];
      output.newAccumulated = this.#recursiveSelector( // next level output update
        newPath, targetMap, recAccumulated, returnAll
      );
    }
    
    // response
    if (returnAll) return output.newAccumulated;
    return output.newAccumulated?.[0];
	}

	//____________
  // API Select
	pinturelliRiskySelect(path) {
    const { newPath, firstAccumulated } = this.#originSelector(path);
    if (newPath.length === 0) return firstAccumulated?.[0];
    const targetMap = this.#allNodesByRoot.get(firstAccumulated[0].rootId);
    return this.#recursiveSelector(newPath, targetMap, firstAccumulated, false);
	}

	//____________
  // API Select
	pinturelliRiskySelectAll(path) {
    const { newPath, firstAccumulated } = this.#originSelector(path);
    if (newPath.length === 0) return firstAccumulated;
    const targetMap = this.#allNodesByRoot.get(firstAccumulated[0].rootId);
    return this.#recursiveSelector(newPath, targetMap, firstAccumulated, true);
	}

	//____________
  // API Clone
  pinturelliClone(path, description = {}) {
    const node = this.pinturelliRiskySelect(path);
    const newId = description.nodeId ?? `${node.nodeId}_0`;
    1_1_1 // devErrors.nodeIdValidator(newId, this.#allNodesByRoot.get(node.rootId));
    return node.clone({ ...description, nodeId: newId });
  }

	//____________
  // API Clone
  pinturelliCloneAll(path, description = {}) {
    const nodes = this.pinturelliRiskySelectAll(path);
    const customId = description?.nodeId;
    return nodes.map((node, index) => {
      const newId = customId ? `${customId}_${index}` : `${node.nodeId}_${index}`;
      1_1_1 // devErrors.nodeIdValidator(newId, this.#allNodesByRoot.get(node.rootId));
      return node.clone({ ...description, nodeId: newId });
    });
  }

	//____________
  // API Destroy
	#recursiveDestroyer(nodeId, targetMap) {
		for (const followerId of this.#allFollowers.get(nodeId)) {
			this.#recursiveDestroyer(followerId, targetMap); // tree recursion
		}

		this.#allFollowers.delete(nodeId);
    this.#allRootsIdsByNodeId.delete(nodeId);
		targetMap.get(nodeId)._removeReferences("everybodycallsmegiorgio");
		targetMap.delete(nodeId);
	}

	//____________
  // API Destroy
	pinturelliRiskyDestroy(path) {
    const node = this.pinturelliRiskySelect(path);
    if (!node) return;
		
    // root case
		if (node.nodeId === node.rootId) {
      const rootId = node.rootId;
      const R_GLOBAL = this.#allRoots.get(rootId);
			for (const followerId of this.#allFollowers.get(rootId)) {
				this.pinturelliRiskyDestroy(`#${followerId}`); // tree recursion
			}

      if (R_GLOBAL.CONFIG.DEBUG) {
        checkpoints.cleanupStarted(rootId);
        this.#cleanupLogger.register(R_GLOBAL.UI_ROOT, [rootId, rootId]);
      }

			this.#allFollowers.delete(rootId);
      this.#allRootsIdsByNodeId.delete(rootId);
      this.#wereInitialized.delete(rootId);
      R_GLOBAL.UI_ROOT._removeReferences("everybodycallsmegiorgio");
      this.#allNodesByRoot.delete(rootId);
			this.#allRoots.delete(rootId);
			return;
		}

    // seed/node case
    const GLOBAL = this.#allRoots.get(node.rootId);
    if (GLOBAL.CONFIG.DEBUG) {
      checkpoints.cleanupStarted(node.nodeId);
      this.#cleanupLogger.register(node, [node.rootId, node.nodeId]);
    }

    const targetMap = this.#allNodesByRoot.get(node.rootId);
		this.#recursiveDestroyer(node.nodeId, targetMap);
	}

	//____________
  // API Destroy
	pinturelliRiskyDestroyAll(path) {
		const nodes = this.pinturelliRiskySelectAll(path);
		for (const node of nodes) {
			this.pinturelliRiskyDestroy(node.nodeId);
		}
	}
}
