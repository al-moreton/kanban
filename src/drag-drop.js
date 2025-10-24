class DragDropManager {
    constructor(config) {
        this.container = config.container;
        this.itemSelector = config.itemSelector;
        this.columnSelector = config.columnSelector;
        this.onReorder = config.onReorder;
        this.onColumnChange = config.onColumnChange;
        this.draggingItem = null;
        this.sourceColumn = null;
    }

    init() {
        this.container.addEventListener('dragstart', (e) => this.dragStart(e));
        this.container.addEventListener('dragend', (e) => this.dragEnd(e));
        this.container.addEventListener('dragover', (e) => this.dragOver(e));
        this.container.addEventListener('dragleave', (e) => this.dragLeave(e));
        this.container.addEventListener('drop', (e) => this.drop(e));
    }

    dragStart(event) {
        const item = event.target.closest(this.itemSelector);
        if (item) {
            this.draggingItem = item;
            this.sourceColumn = item.closest(this.columnSelector);
            item.classList.add('dragging');
            event.dataTransfer.effectAllowed = 'move';
        }
    }

    dragEnd(event) {
        if (this.draggingItem) {
            this.draggingItem.classList.remove('dragging');

            this.container.querySelectorAll(this.columnSelector).forEach(column => {
                column.classList.remove('drag-over');
            });
            
            this.container.querySelectorAll(this.itemSelector).forEach(item => {
                item.classList.remove('drop');
            });

            const targetColumn = this.draggingItem.closest(this.columnSelector);

            if (targetColumn && this.sourceColumn && targetColumn !== this.sourceColumn) {
                const experimentId = this.draggingItem.dataset.id;
                const sourceColumnId = this.sourceColumn.dataset.id;
                const targetColumnId = targetColumn.dataset.id;
                
                if (this.onColumnChange) {
                    this.onColumnChange(experimentId, sourceColumnId, targetColumnId);
                }
            }

            if (this.onReorder && targetColumn) {
                this.onReorder(targetColumn.dataset.id);
            }
            
            this.draggingItem = null;
            this.sourceColumn = null;
        }
    }

    dragOver(event) {
        event.preventDefault();
        if (!this.draggingItem) return;

        const targetColumn = event.target.closest(this.columnSelector);
        if (!targetColumn) return;

        targetColumn.classList.add('drag-over');

        const dropTarget = event.target.closest(this.itemSelector);

        if (dropTarget && dropTarget !== this.draggingItem) {
            const rect = dropTarget.getBoundingClientRect();
            const midpoint = rect.top + (rect.height / 2);
            
            if (event.clientY <= midpoint) {
                targetColumn.insertBefore(this.draggingItem, dropTarget);
            } else {
                targetColumn.insertBefore(this.draggingItem, dropTarget.nextSibling);
            }
        } else if (!dropTarget && event.target.closest(this.columnSelector)) {
            targetColumn.appendChild(this.draggingItem);
        }
    }

    dragLeave(event) {
        const column = event.target.closest(this.columnSelector);
        if (column && !column.contains(event.relatedTarget)) {
            column.classList.remove('drag-over');
        }
    }

    drop(event) {
        event.preventDefault();
        event.stopPropagation();
    }
}

export { DragDropManager };