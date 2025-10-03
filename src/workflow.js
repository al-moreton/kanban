class Workflow {
    constructor(name,order) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.order = order;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            order: this.order,
        }
    }

    static fromJSON(obj) {
        const n = new Workflow(obj.name, obj.order);
        n.id = obj.id;
        return n;
    }
}

class WorkflowStorage {
    constructor() {
        this.storageKey = 'myWorkflow';
        this.workflowArray = [];
        this.loadWorkflow();
    }

    saveWorkflow() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.workflowArray));
    }

    loadWorkflow() {
        const data = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        this.workflowArray = data.map(Workflow.fromJSON);
        if (this.workflowArray.length === 0) this.seedWorkflow();
    }

    seedWorkflow() {
        this.workflowArray = [
            new Workflow('planning'),
            new Workflow('design'),
            new Workflow('dev'),
            new Workflow('launch'),
        ];
        this.saveWorkflow();
    }
}

export { Workflow, WorkflowStorage };

// stop duplicate statuses