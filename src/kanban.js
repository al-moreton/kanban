import { KanbanSettings } from './settings.js';
import { AddExperiment } from './add-experiment.js';
import { DragDropManager } from './drag-drop.js';
import { Notifications } from './notification.js';

class Kanban {
    constructor(experiments, workflow) {
        this.experiments = experiments;
        this.workflow = workflow;
        this.kanbanDiv = document.querySelector('.kanban-board');
        this.kanbanColumns = document.querySelectorAll('.kanban-column');
        this.settings = new KanbanSettings(workflow, this);
        this.addExperiment = new AddExperiment(workflow, experiments, this);
        this.dragManager = null;
        this.notification = new Notifications();

        this.dragManager = new DragDropManager({
            container: this.kanbanDiv,
            itemSelector: '.experiment-card',
            columnSelector: '.kanban-column',
            onReorder: (columnId) => this.updateExperimentOrder(columnId),
            onColumnChange: (experimentId, sourceColumnId, targetColumnId) => this.handleColumnChange(experimentId, sourceColumnId, targetColumnId)
        });
        this.dragManager.init();
    }

    refreshKanban() {
        this.renderColumns();
        if (this.renderColumns()) {
            for (let i = 0; i < this.workflow.workflowArray.length; i++) {
                const workflowItem = this.workflow.workflowArray[i];
                const column = this.kanbanDiv.querySelector(
                    `.kanban-column[data-id="${workflowItem.id}"]`
                );

                if (column) {
                    // Render experiments in the order specified by items array
                    workflowItem.items.forEach(experimentId => {
                        const experiment = this.experiments.experimentArray.find(e => e.id === experimentId);
                        if (experiment) {
                            this.renderExperiments(experiment, column);
                        }
                    });
                }
            }
        }
    }

    handleColumnChange(experimentId, sourceColumnId, targetColumnId) {
        const experiment = this.experiments.experimentArray.find(e => e.id === experimentId);
        const targetWorkflow = this.workflow.workflowArray.find(w => w.id === targetColumnId);

        if (experiment && targetWorkflow) {
            experiment.workflowId = targetColumnId;
            experiment.workflow = targetWorkflow.name;

            const sourceWorkflow = this.workflow.workflowArray.find(w => w.id === sourceColumnId);
            if (sourceWorkflow) {
                sourceWorkflow.items = sourceWorkflow.items.filter(id => id !== experimentId);
            }

            if (!targetWorkflow.items.includes(experimentId)) {
                targetWorkflow.items.push(experimentId);
            }
            this.experiments.saveExperiments();
            this.workflow.saveWorkflow();
            this.refreshKanban();
            this.notification.show('Experiment moved', 'success');
        }
    }

    updateExperimentOrder(columnId) {
        const column = this.kanbanDiv.querySelector(`.kanban-column[data-id="${columnId}"]`);
        const cards = column.querySelectorAll('.experiment-card');
        const workflow = this.workflow.workflowArray.find(w => w.id === columnId);

        if (workflow) {
            // Rebuild the items array based on current DOM order
            workflow.items = Array.from(cards).map(card => card.dataset.id);
            this.workflow.saveWorkflow();
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
        return true;
    }

    renderExperiments(experiment, column) {
        const div = document.createElement('div');
        div.classList.add('experiment-card');
        div.classList.add('edit-experiment-button');
        div.setAttribute('draggable', 'true');
        div.dataset.id = experiment.id;
        div.innerHTML = `
            <div class="experiment-title edit-experiment-button">
                ${experiment.title}
            </div>
            <div class="experiment-description edit-experiment-button">
                ${experiment.description}
            </div>
        `;
        column.appendChild(div);
        div.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-experiment-button')) {
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