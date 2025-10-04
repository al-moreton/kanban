class Workflow {
    constructor(name, order) {
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
    constructor(experiments) {
        this.storageKey = 'myWorkflow';
        this.workflowArray = [];
        this.experiments = experiments;
        this.loadWorkflow();
    }

    saveWorkflow() {
        // order workflow on every save
        // this.workflowArray.sort((a, b) => a.order - b.order);
        localStorage.setItem(this.storageKey, JSON.stringify(this.workflowArray));
    }

    loadWorkflow() {
        const data = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        this.workflowArray = data.map(Workflow.fromJSON);
        if (this.workflowArray.length === 0) this.seedWorkflow();
    }

    addStatus(status) {
        const newStatusOrder = this.workflowArray.length + 1;
        const newStatus = new Workflow(status, newStatusOrder);
        this.workflowArray.push(newStatus);
        this.saveWorkflow();
    }

    deleteStatus(status) {
        // Need to stop deletion if only one status is left
        const index = this.workflowArray.findIndex(b => b.id == status);
        if (index >= 0) {
            const targetStatusIndex = index === 0 ? 1 : 0;
            const targetStatusId = this.workflowArray[targetStatusIndex].id;
            const targetStatusName = this.workflowArray[targetStatusIndex].name;

            this.experiments.experimentArray.forEach(experiment => {
                if (experiment.workflowId === status) {
                    experiment.workflowId = targetStatusId;
                    experiment.workflow = targetStatusName;
                }
            })
            this.workflowArray.splice(index, 1);
            this.experiments.saveExperiments();
        }
        this.saveWorkflow();
    }

    seedWorkflow() {
        this.workflowArray = [
            new Workflow('planning', 1),
            new Workflow('design', 3),
            new Workflow('dev', 2),
            new Workflow('launch', 4),
        ];
        this.saveWorkflow();
    }
}

export { Workflow, WorkflowStorage };

// stop duplicate statuses