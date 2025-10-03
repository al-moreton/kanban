class Experiment {
    constructor(title, workflow, workflowId) {
        this.id = crypto.randomUUID();
        this.title = title;
        this.workflow = workflow;
        this.workflowId = workflowId;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            workflow: this.workflow,
            workflowId: this.workflowId,
        }
    }

    static fromJSON(obj) {
        const n = new Experiment(obj.title, obj.workflow, obj.workflowId);
        n.id = obj.id;
        return n;
    }
}

class ExperimentStorage {
    constructor() {
        this.storageKey = 'myExperiments';
        this.experimentArray = [];
        this.loadExperiments();
    }

    saveExperiments() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.experimentArray));
    }

    loadExperiments() {
        const data = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        this.experimentArray = data.map(Experiment.fromJSON);
        if (this.experimentArray.length === 0) this.seedExperiments();
    }

    seedExperiments() {
        this.experimentArray = [
            new Experiment('Test 1', 'planning'),
            new Experiment('Test 2', 'planning'),
            new Experiment('Test 3', 'design'),
        ];
        this.saveExperiments();
    }
}

export { Experiment, ExperimentStorage };