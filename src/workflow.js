import { Notifications } from './notification.js';

class Workflow {
    constructor(name, order) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.items = [];
        this.order = order;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            items: this.items,
            order: this.order,
        }
    }

    static fromJSON(obj) {
        const n = new Workflow(obj.name, obj.order);
        n.id = obj.id;
        n.items = obj.items || [];
        return n;
    }
}

class WorkflowStorage {
    constructor(experiments) {
        this.storageKey = 'myWorkflow';
        this.workflowArray = [];
        this.experiments = experiments;
        this.notification = new Notifications();
        this.loadWorkflow();
    }

    saveWorkflow() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.workflowArray));
    }

    loadWorkflow() {
        const data = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        this.workflowArray = data.map(Workflow.fromJSON);
        if (this.workflowArray.length === 0) this.seedWorkflow();
        this.syncExperimentItems();
    }

    syncExperimentItems() {
        this.workflowArray.forEach(workflow => {
            // Remove experiment IDs that no longer exist
            workflow.items = workflow.items.filter(itemId =>
                this.experiments.experimentArray.some(exp => exp.id === itemId)
            );
        });

        // Add any experiments that aren't in their workflow's items array
        this.experiments.experimentArray.forEach(experiment => {
            const workflow = this.workflowArray.find(w => w.id === experiment.workflowId);
            if (workflow && !workflow.items.includes(experiment.id)) {
                workflow.items.push(experiment.id);
            }
        });

        // Remove experiments from workflows they no longer belong to
        this.workflowArray.forEach(workflow => {
            workflow.items = workflow.items.filter(itemId => {
                const experiment = this.experiments.experimentArray.find(exp => exp.id === itemId);
                return experiment && experiment.workflowId === workflow.id;
            });
        });

        this.saveWorkflow();
    }

    addStatus(status) {
        const newStatusOrder = this.workflowArray.length + 1;
        const newStatus = new Workflow(status, newStatusOrder);
        this.workflowArray.push(newStatus);
        this.saveWorkflow();
    }

    deleteStatus(status) {
        if (this.workflowArray.length <= 1) {
            this.notification.show('Can\'t delete status', 'error');
            return;
        }

        const index = this.workflowArray.findIndex(b => b.id == status);
        if (index < 0) return;

        const deletedWorkflow = this.workflowArray[index];

        const targetStatusIndex = index === 0 ? 1 : index - 1;
        const targetWorkflow = this.workflowArray[targetStatusIndex];
        if (!targetWorkflow) return;

        this.experiments.experimentArray.forEach(exp => {
            if (exp.workflowId === deletedWorkflow.id) {
                exp.workflowId = targetWorkflow.id;
                exp.workflow = targetWorkflow.name;

                // Add experiment to new workflow's items list
                if (!targetWorkflow.items.includes(exp.id)) {
                    targetWorkflow.items.push(exp.id);
                }
            }
        });

        this.workflowArray.splice(index, 1);

        this.syncExperimentItems();

        this.experiments.saveExperiments();
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