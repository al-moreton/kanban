import { Experiment, ExperimentStorage } from './experiments.js';
import { WorkflowStorage } from './workflow.js';
import { Kanban } from './kanban.js';

class KanbanApp {
    constructor() {
        this.experiments = new ExperimentStorage();
        this.workflow = new WorkflowStorage(this.experiments);
        this.kanban = new Kanban(this.experiments, this.workflow);
    }

    init() {
        this.kanban.refreshKanban();
        this.bindEvents();
    }

    bindEvents() {
        document.querySelector('.kanban-header').addEventListener('click', (e) => {
            if (e.target.classList.contains('add-experiment-button')) {
                this.kanban.openAddExperimentModal();
            }
            if (e.target.classList.contains('kanban-settings-button')) {
                this.kanban.openSettingsModal();
            }
        })

        document.querySelector('.add-experiment-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('add-experiment-form-submit')) {
                this.handleAddExperiment(e);
            }
            if (e.target.classList.contains('add-experiment-form-close')) {
                this.kanban.closeAddExperimentModal();
            }
        })

        document.querySelector('.kanban-settings-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('kanban-settings-close')) {
                this.kanban.closeSettingsModal();
            }
        })
    }

    handleAddExperiment(e) {
        e.preventDefault();
        const modal = document.querySelector('.add-experiment-modal');
        const titleInput = modal.querySelector('#experiment-title');
        const descriptionInput = modal.querySelector('#experiment-description');
        const statusDropdown = modal.querySelector('#experiment-status');

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const workflow = statusDropdown.value;
        const workflowId = statusDropdown.selectedOptions[0].dataset.id;

        if (title && workflow) {
            const newExperiment = new Experiment(title, workflow, workflowId, description);
            this.experiments.experimentArray.push(newExperiment);
            this.experiments.saveExperiments();
            this.kanban.closeAddExperimentModal();
            this.kanban.refreshKanban();
        }

        // Needs error messages on form
    }
}

const app = new KanbanApp();
app.init();

// split into arrays based on status
// render columns
// render the experiments in each column
// status objects should have an order number to determine layout of kanban