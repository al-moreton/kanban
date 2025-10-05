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

            card.addEventListener('dragstart', (e) => this.dragStart(e));
            card.addEventListener('dragend', (e) => this.dragEnd(e));
            card.addEventListener('dragover', (e) => this.dragOver(e));
            card.addEventListener('dragleave', (e) => this.dragLeave(e));
            card.addEventListener('drop', (e) => this.drop(e));
        });
    }

    dragStart(event) {
        event.currentTarget.classList.add('dragging');
    }

    dragEnd(event) {
        event.currentTarget.classList.remove('dragging');
        this.modal.querySelectorAll('.workflow-list-card').forEach(card => {
            card.classList.remove('drop');
        });
        this.updateWorkflowOrder();
    }

    dragOver(event) {
        event.preventDefault();
        const draggingCard = this.modal.querySelector('.dragging');
        const currentCard = event.currentTarget;
        const dropTarget = event.currentTarget;

        if (draggingCard && dropTarget !== draggingCard && dropTarget.classList.contains('workflow-list-card')) {
            this.workflowList.insertBefore(draggingCard, dropTarget);
        }

        if (currentCard !== draggingCard && currentCard.classList.contains('workflow-list-card')) {
            currentCard.classList.add('drop');
        }
    }

    dragLeave(event) {
        event.currentTarget.classList.remove('drop');
    }

    drop(event) {
        event.preventDefault();

        const draggingCard = this.modal.querySelector('.dragging');
        const dropTarget = event.currentTarget;

        this.modal.querySelectorAll('.workflow-list-card').forEach(card => {
            card.classList.remove('drop');
        });

        if (draggingCard && dropTarget !== draggingCard && dropTarget.classList.contains('workflow-list-card')) {
            this.workflowList.insertBefore(draggingCard, dropTarget);
            this.updateWorkflowOrder();
        }
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