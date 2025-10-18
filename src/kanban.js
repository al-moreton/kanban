import { KanbanSettings } from './settings.js';
import { AddExperiment } from './add-experiment.js';
import { DragDropManager } from './drag-drop.js';

class Kanban {
    constructor(experiments, workflow) {
        this.experiments = experiments;
        this.workflow = workflow;
        this.kanbanDiv = document.querySelector('.kanban-board');
        this.kanbanColumns = document.querySelectorAll('.kanban-column');
        this.settings = new KanbanSettings(workflow, this);
        this.addExperiment = new AddExperiment(workflow, experiments, this);
    }

    refreshKanban() {
        this.renderColumns();
        if (this.renderColumns()) {
            let exp = [];
            for (let i = 0; i < this.workflow.workflowArray.length; i++) {
                const statusName = this.workflow.workflowArray[i].name;
                const exp = this.experiments.experimentArray.filter(
                    experiment => experiment.workflow === statusName
                );

                const column = this.kanbanDiv.querySelector(
                    `.kanban-column[data-id="${this.workflow.workflowArray[i].id}"]`
                );

                if (column) {
                    exp.forEach(experiment => {
                        this.renderExperiments(experiment, column);
                    });
                }
            }
        }
    }

    renderColumns() {
        this.kanbanDiv.innerHTML = '';
        if (this.workflow.workflowArray.length === 0) {
            this.kanbanDiv.textContent = 'No workflow found';
            return false;
        }
        const orderedColumns = this.workflow.workflowArray.sort((a, b) => a.order - b.order);
        this.kanbanDiv.style.gridTemplateColumns = `repeat(${orderedColumns.length}, minmax(100px, 1fr))`;
        for (let i = 0; i < orderedColumns.length; i++) {
            const experiments = this.experiments.experimentArray.filter(experiment => experiment.workflowId == orderedColumns[i].id)
            const div = document.createElement('div');
            div.classList.add('kanban-column');
            div.dataset.id = orderedColumns[i].id;
            div.innerHTML = `
                <div class="kanban-column-header">
                    <div class="kanban-column-title">
                        ${orderedColumns[i].name} <span class="kanban-column-number">${experiments.length}</span>
                    </div>
                    <div class="kanban-column-button" data-status="${orderedColumns[i].id}"></div>
                </div>
        `;
            this.kanbanDiv.appendChild(div);
            div.addEventListener('click', (e) => {
                if (e.target.classList.contains('kanban-column-button')) {
                    this.addExperiment.open(orderedColumns[i].id);
                }
            })
        }

        const dragManager = new DragDropManager({
            container: this.kanbanDiv,
            itemSelector: '.experiment-card',
            // onReorder: () => this.updateWorkflowOrder()
            onReorder: null
        });
        dragManager.init();

        return true;
    }

    renderExperiments(experiment, column) {
        const div = document.createElement('div');
        div.classList.add('experiment-card');
        div.dataset.id = experiment.id;
        div.innerHTML = `
            <div class="experiment-title">
                ${experiment.title}
            </div>
            <div class="experiment-description">
                ${experiment.description}
            </div>
            <button type="button" id="edit-experiment-button" data-id="${experiment.id}">Edit</button>
        `;
        column.appendChild(div);
        div.addEventListener('click', (e) => {
            if (e.target.id === 'edit-experiment-button') {
                this.addExperiment.edit(experiment.id);
            }
        })
    }

    openAddExperimentModal() {
        this.addExperiment.open();
    }

    closeAddExperimentModal() {
        this.addExperiment.close();
    }

    openSettingsModal() {
        this.settings.open();
    }

    closeSettingsModal() {
        this.settings.close();
    }
}

export { Kanban };