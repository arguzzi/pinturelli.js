// import devErrors from "./debug/devErrorsRegistry.js";
// import memoryLogs from "./debug/_memoryLogs.js";

////////////////////////////
//
export default class Registry {
	static #instanced = false;
	static #rootCount = 0;
	#createGlobal = null;
  #stateManagers = null;
  #UiGestures = null;
	#UiClasses = null;
	#allRoots = new Map(); // [["id": GLOBAL] ...]
	#allNodesByRoot = new Map(); // [["id": new Map([["id": node] ...])] ...]
  #allRootsIdsByNodeId = new Map(); // [["id": "id"] ...] (nodeId => rootId)
	#allFollowers = new Map(); // [["id": new Set(["id", "id", ...])] ...]
	#wereInitialized = new Set(); // ["id", "id", ...]
  #cleanupTracker = new FinalizationRegistry(id => memoryLogs.cleanupEnded(id));

	//____________
	constructor(imports) {

		// singleton pattern
    1_1_1 // devErrors.duplicatedRegistry(Registry.#instanced);
		Registry.#instanced = true;

		this.#createGlobal = imports.createGlobal;
    this.#stateManagers = imports.stateManagers;
    this.#UiGestures = imports.UiGestures;
		this.#UiClasses = imports.UiClasses;
	}

	//____________
  // API Root
	#allNodesProxyCreator(rootId) {
		const allNodes = this.#allNodesByRoot.get(rootId);
		return new Proxy({}, {

      // only returns nodes from this root
			get: (_, id) => {
				return allNodes.get(id);
			},

      // prevent modification
			set: () => false,

      // only check nodes from this root
			has: (_, id) => {
				return !!allNodes.has(id);
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
          writable: false
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
  #followersProxyCreator(id) {
    const followersSet = this.#allFollowers.get(id);
    const getFollowersIds = () => Array.from(followersSet || []);
    return new Proxy([], {

      // simulate array of followers ids
      get: (_, prop) => {
        
        // length property
        if (prop === "length") return followersSet.size;
        
        // indexed properties
        const ids = getFollowersIds();
        if (typeof prop === "string" && /^\d+$/.test(prop)) { // positive int
          return ids[Number(prop)]; // return value at that position
        }

        // needed by for...of 
        if (prop === Symbol.iterator) {
          const ids = getFollowersIds();
          return ids[Symbol.iterator].bind(ids);
        }

        // prototype properties
        if (prop in Array.prototype) {
          const propValue = Array.prototype[prop];
          if (typeof propValue !== "function") return propValue;
          return propValue.bind(ids); // object/array methods
        }

        // unknown property
        return undefined
      },

      // prevent modification
      set: () => false,

      // simulate array
      has: (_, prop) => {
        if (prop === "length") return true;
        if (typeof prop === "string" && /^\d+$/.test(prop)) { // positive int
          return Number(prop) < followersSet.size;
        }
        return false; // unknown property
      },

      // simulate array
      ownKeys: () => {
        return  Array.from(
          { length: followersSet.size }, 
          (_, i) => i.toString()
        ).concat("length");
      },

      // needed by ownKeys
      getOwnPropertyDescriptor: (_, prop) => {
        if (prop === "length") return {
          configurable: false,
          enumerable: false,
          value: followersSet.size,
          writable: false,
        }

        const ids = getFollowersIds();
        if (typeof prop === "string" && /^\d+$/.test(prop)) {
          const index = Number(prop);
          if (index < ids.length) return {
            configurable: false,
            enumerable: true,
            value: ids[index],
            writable: false,
          }
        }
        if (prop === Symbol.iterator) {
          return {
            configurable: false,
            enumerable: false,
            value: ids[Symbol.iterator].bind(ids),
            writable: false
          };
        }
        return undefined;
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
		const rootId = description.customRootId ?? `_root_${Registry.#rootCount}`;
		1_1_1 // devErrors.pinturelliRoot(this.#allRoots, rootId);
    
    // new global object
    this.#allNodesByRoot.set(rootId, new Map()); // memory update (1/5)
    this.#allRootsIdsByNodeId.set(rootId, rootId); // memory update (2/5)
		this.#allFollowers.set(rootId, new Set()); // memory update (3/5)
		const allNodesProxy = this.#allNodesProxyCreator(rootId);
		const initializer = () => this.#initializeSeeds(rootId);
    const selectAll = this.pinturelliRiskySelectAll.bind(this);
		const GLOBAL = this.#createGlobal({
        ...description,
        id: rootId,
        rootId: rootId,
        _id_followers: this.#followersProxyCreator(rootId), // read-only>> []
        allNodesProxy, // read-only>> GLOBAL.ALL_NODES: { nodeId: node, ...}
        initializer, // executed in sketch preload (before loading assets)
        selectAll,
      },
		);

    const root = GLOBAL.UI_ROOT;
    this.#allNodesByRoot.get(rootId).set("_", root); // memory update (4a/5)
    this.#allNodesByRoot.get(rootId).set(rootId, root); // memory update (4b/5)
		this.#allRoots.set(rootId, GLOBAL); // memory update (5/5)
    Registry.#rootCount++;
		return root;
	}

	//____________
  // API Node
	pinturelliNode(description) {
    1_1_1 // devErrors.pinturelliNode(description, this.#allRoots, this.#allNodesByRoot);

    // update relations
    const { id: nodeId, rootId: rootId } = description;
    this.#allRootsIdsByNodeId.set(nodeId, rootId);
    const hasFollowers = this.#allFollowers.has(nodeId);
    if (!hasFollowers) this.#allFollowers.set(nodeId, new Set());
    const followingId = description?.state?.followingId ?? rootId;
    const equalsFollowers = this.#allFollowers.get(followingId);
    if (equalsFollowers) equalsFollowers.add(nodeId);
    else this.#allFollowers.set(followingId, new Set([nodeId]));

    // state property
    const { state = {}, ...newDescription } = description;
    const privateState = {
      ...state,
      labels: state?.labels ?? [],
      followingId,
    };

		// lazy loaded (after initialization)
		if (this.#wereInitialized.has(rootId)) {
      return this.#addNode({
        UiClass: "Block",
        UiGestures: [],
        ...newDescription, // validated id and root. no state property
        _id_followers: this.#followersProxyCreator(nodeId),
        _privateState: privateState,
      });
    }

		// eager loaded (before initialization)
    const heared = []; // seed memory for primary events
    const pinturelliNode = this.pinturelliNode.bind(this); // clonator
		const seed = Object.freeze({
      UiClass: "Block",
      UiGestures: [],
			...newDescription, // validated id and root. no state property
      _id_followers: this.#followersProxyCreator(nodeId),
      _privateState: privateState,
      _getPublicState: key => privateState[key], // closure (read-only)
      _removeReferences: () => undefined, // useless before initialization
      _handled: heared, // expected mutation via closure
			hear: (...args) => heared.push(args), // closure (setter)
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
		1_1_1 // devErrors.addNode(description, this.#UiGestures, this.#UiClasses);
    
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
		const UiClass = this.#UiClasses[description.UiClass ?? "Block"];
		const newNode = Object.freeze(new UiClass(dependencies, description)); //<@!
		this.#allNodesByRoot.get(description.rootId).set(description.id, newNode);
		return newNode;
	}
  
	//____________
  // API Node
	#initializeSeeds(rootId) {
    if (this.#wereInitialized.has(rootId)) return;
    this.#wereInitialized.add(rootId); // first time flag

		// eager loaded nodes (from seeds to nodes)
    const allSeeds = [ ...this.#allNodesByRoot.get(rootId).values() ];
		for (const seed of allSeeds) {
			const node = this.#addNode(seed); // overwrites seed in allNodesByRoot
			seed._heared.forEach(args => node.hear(...args));
		}

		// relations validation and completed log
    const GLOBAL = this.#allRoots.get(rootId);
    1_1_1 // devErrors.runInitialization(GLOBAL, allSeeds);
    if (GLOBAL.CONFIG.DEBUG) memoryLogs.newTree(GLOBAL);
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
        node._id_followers.reduce((acc, followerId) => {
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
        return followed._id_followers.reduce((acc, followerId) => {
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
        if (addedIds.has(node.id)) 1_1_1 // devErrors.loopInTree();
        addedIds.add(node.id);
        acc.push(node); // depth-first traversal (dfs), preorder variant
        for (const follower of node._id_followers) {
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
    const newId = description.id ?? `${node.id}_0`;
    1_1_1 // devErrors.nodeIdValidator(newId, this.#allNodesByRoot.get(node.rootId));
    return node.clone({ ...description, id: newId });
  }

	//____________
  // API Clone
  pinturelliCloneAll(path, description = {}) {
    const nodes = this.pinturelliRiskySelectAll(path);
    const customId = description?.id;
    return nodes.map((node, index) => {
      const newId = customId ? `${customId}_${index}` : `${node.id}_${index}`;
      1_1_1 // devErrors.nodeIdValidator(newId, this.#allNodesByRoot.get(node.rootId));
      return node.clone({ ...description, id: newId });
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
		if (node.id === node.rootId) {
      const rootId = node.rootId;
      const R_GLOBAL = this.#allRoots.get(rootId);
			for (const followerId of this.#allFollowers.get(rootId)) {
				this.pinturelliRiskyDestroy(`#${followerId}`); // tree recursion
			}

      if (R_GLOBAL.CONFIG.DEBUG) {
        memoryLogs.cleanupStarted(rootId);
        this.#cleanupTracker.register(R_GLOBAL.UI_ROOT, rootId);
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
      memoryLogs.cleanupStarted(node.id);
      this.#cleanupTracker.register(node, node.id);
    }

    const targetMap = this.#allNodesByRoot.get(node.rootId);
		this.#recursiveDestroyer(node.id, targetMap);
	}

	//____________
  // API Destroy
	pinturelliRiskyDestroyAll(path) {
		const nodes = this.pinturelliRiskySelectAll(path);
		for (const node of nodes) {
			this.pinturelliRiskyDestroy(`#${node.id}`);
		}
	}
}
