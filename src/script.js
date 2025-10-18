import { ExperimentStorage } from './experiments.js';
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

        document.querySelector('.kanban-settings-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('kanban-settings-close')) {
                this.kanban.closeSettingsModal();
            }
        })
    }
}

const app = new KanbanApp();
app.init();

// split into arrays based on status
// render columns
// render the experiments in each column
// status objects should have an order number to determine layout of kanban