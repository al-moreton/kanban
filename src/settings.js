import { DragDropManager } from './drag-drop.js';

class KanbanSettings {
    constructor(workflow, kanban) {
        this.workflow = workflow;
        this.kanban = kanban;
        this.modal = null;
        this.workflowList = null;
    }

    open() {
        this.modal = document.querySelector('.kanban-settings-modal');
        this.workflowList = this.modal.querySelector('.workflow-list');

        this.renderWorkflowList();
        this.setupModalEventListeners();
        this.modal.showModal();
    }

    close() {
        this.modal.close();
        this.kanban.refreshKanban();
    }

    setupModalEventListeners() {
        this.modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('settings-delete-status-button')) {
                this.workflow.deleteStatus(e.target.dataset.id);
                this.renderWorkflowList();
            }
            if (e.target.classList.contains('settings-add-status-button')) {
                const statusName = this.modal.querySelector('#status-name');
                e.preventDefault();
                if (statusName.value) {
                    this.workflow.addStatus(statusName.value);
                }
                this.renderWorkflowList();
                statusName.value = '';
            }
        });
    }

    renderWorkflowList() {
        this.workflowList.innerHTML = '';

        this.workflow.workflowArray.forEach(workflow => {
            const card = document.createElement('div');
            card.classList.add('workflow-list-card');
            card.setAttribute('draggable', 'true');
            card.dataset.id = workflow.id;
            card.dataset.order = workflow.order;

            const status = document.createElement('div');
            status.textContent = workflow.name;

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('settings-delete-status-button');
            deleteButton.dataset.id = workflow.id;
            deleteButton.textContent = '-';

            this.workflowList.appendChild(card);
            card.appendChild(status);
            card.appendChild(deleteButton);
        });

        const dragManager = new DragDropManager({
            container: this.workflowList,
            itemSelector: '.workflow-list-card',
            onReorder: () => this.updateWorkflowOrder()
        });
        dragManager.init();
    }

    updateWorkflowOrder() {
        const cards = this.workflowList.querySelectorAll('.workflow-list-card');
        cards.forEach((card, index) => {
            const workflowId = card.dataset.id;
            const workflow = this.workflow.workflowArray.find(w => w.id == workflowId);
            if (workflow) {
                workflow.order = index + 1;
            }
        });
        this.workflow.saveWorkflow();
    }
}

export { KanbanSettings };