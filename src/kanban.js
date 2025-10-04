class Kanban {
    constructor(experiments, workflow) {
        this.experiments = experiments;
        this.workflow = workflow;
        this.kanbanDiv = document.querySelector('.kanban-board');
        this.kanbanColumns = document.querySelectorAll('.kanban-column');
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
        this.kanbanDiv.style.gridTemplateColumns = `repeat(${orderedColumns.length}, 1fr)`;
        for (let i = 0; i < orderedColumns.length; i++) {
            const div = document.createElement('div');
            div.classList.add('kanban-column');
            div.dataset.id = orderedColumns[i].id;
            div.innerHTML = `
                <div class="kanban-column-title">
                    ${orderedColumns[i].name}
                </div>
        `;
            this.kanbanDiv.appendChild(div);
        }
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
            <div class="experiment-status">
                ${experiment.workflow}
            </div>
        `;
        column.appendChild(div);
    }

    openAddExperimentModal() {
        const modal = document.querySelector('.add-experiment-modal');
        const statusDropdown = modal.querySelector('#experiment-status');

        statusDropdown.innerHTML = '';

        this.workflow.workflowArray.forEach(workflow => {
            const option = document.createElement('option');
            option.dataset.id = workflow.id;
            option.value = workflow.name;
            option.textContent = workflow.name;
            statusDropdown.appendChild(option);
        })

        modal.showModal();
    }

    closeAddExperimentModal() {
        const modal = document.querySelector('.add-experiment-modal');
        const titleInput = modal.querySelector('#experiment-title');

        titleInput.value = '';
        modal.close();
    }

    openSettingsModal() {
        const modal = document.querySelector('.kanban-settings-modal');
        const workflowList = modal.querySelector('.workflow-list');

        const dragStart = (event) => {
            event.currentTarget.classList.add('dragging');
        }

        const dragEnd = (event) => {
            event.currentTarget.classList.remove('dragging');
            modal.querySelectorAll('.workflow-list-card').forEach(card => {
                card.classList.remove('drop');
            });
        }

        const dragOver = (event) => {
            event.preventDefault();
            const draggingCard = modal.querySelector('.dragging');
            const currentCard = event.currentTarget;

            if (currentCard !== draggingCard && currentCard.classList.contains('workflow-list-card')) {
                currentCard.classList.add('drop');
            }
        }

        const dragLeave = (event) => {
            event.currentTarget.classList.remove('drop');
        }

        const drop = (event) => {
            event.preventDefault();

            const draggingCard = modal.querySelector('.dragging');
            const dropTarget = event.currentTarget;

            modal.querySelectorAll('.workflow-list-card').forEach(card => {
                card.classList.remove('drop');
            });

            if (draggingCard && dropTarget !== draggingCard && dropTarget.classList.contains('workflow-list-card')) {
                workflowList.insertBefore(draggingCard, dropTarget);
                updateWorkflowOrder();
            }
        }

        const updateWorkflowOrder = () => {
            const cards = workflowList.querySelectorAll('.workflow-list-card');
            cards.forEach((card, index) => {
                const workflowId = card.dataset.id;
                const workflow = this.workflow.workflowArray.find(w => w.id == workflowId);
                if (workflow) {
                    workflow.order = index + 1;
                    this.workflow.saveWorkflow();
                }
            });
        }

        const renderWorkflowList = () => {
            workflowList.innerHTML = '';

            this.workflow.workflowArray.forEach(workflow => {
                const list = document.querySelector('.workflow-list');
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

                workflowList.appendChild(card);
                card.appendChild(status);
                card.appendChild(deleteButton);

                card.addEventListener('dragstart', dragStart);
                card.addEventListener('dragend', dragEnd);
                card.addEventListener('dragover', dragOver);
                card.addEventListener('dragleave', dragLeave);
                card.addEventListener('drop', drop);
            })
        }

        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('settings-delete-status-button')) {
                this.workflow.deleteStatus(e.target.dataset.id);
                renderWorkflowList();
            }
            if (e.target.classList.contains('settings-add-status-button')) {
                const statusName = modal.querySelector('#status-name');
                e.preventDefault();
                if (statusName.value) {
                    this.workflow.addStatus(statusName.value);
                }
                renderWorkflowList();
                statusName.value = '';
            }
        })

        renderWorkflowList();
        modal.showModal();
    }

    closeSettingsModal() {
        const modal = document.querySelector('.kanban-settings-modal');
        modal.close();
        this.refreshKanban();
    }
}

export { Kanban };