class BTreeNode {
    // ... existing methods ...

    async delete(value, tree) {
        await tree.visualizeStep(`Searching for ${value} to delete`);
        let index = this.findKeyIndex(value);

        if (index < this.keys.length && this.keys[index] === value) {
            if (this.isLeaf) {
                await tree.visualizeStep(`Found ${value} in leaf node, removing it`);
                this.keys.splice(index, 1);
            } else {
                await this.deleteFromNonLeaf(index, tree);
            }
        } else {
            if (this.isLeaf) {
                await tree.visualizeStep(`${value} not found in leaf node`);
                return false;
            }

            const lastChild = index === this.keys.length;
            await tree.visualizeStep(`Moving to ${lastChild ? 'last' : 'appropriate'} child node`);

            if (this.children[index].keys.length < tree.order) {
                await this.fillChild(index, tree);
            }

            if (lastChild && index > this.children.length - 1) {
                await this.children[index - 1].delete(value, tree);
            } else {
                await this.children[index].delete(value, tree);
            }
        }
        return true;
    }

    async deleteFromNonLeaf(index, tree) {
        const key = this.keys[index];
        await tree.visualizeStep(`Deleting ${key} from internal node`);

        if (this.children[index].keys.length >= tree.order) {
            const pred = await this.getPredecessor(index, tree);
            this.keys[index] = pred;
            await tree.visualizeStep(`Replaced ${key} with predecessor ${pred}`);
            await this.children[index].delete(pred, tree);
        }
        else if (this.children[index + 1].keys.length >= tree.order) {
            const succ = await this.getSuccessor(index, tree);
            this.keys[index] = succ;
            await tree.visualizeStep(`Replaced ${key} with successor ${succ}`);
            await this.children[index + 1].delete(succ, tree);
        }
        else {
            await this.mergeChildren(index, tree);
            await this.children[index].delete(key, tree);
        }
    }

    // Helper methods for deletion
    async getPredecessor(index, tree) {
        let current = this.children[index];
        while (!current.isLeaf) {
            await tree.visualizeStep('Finding predecessor: moving to rightmost child');
            current = current.children[current.children.length - 1];
        }
        return current.keys[current.keys.length - 1];
    }

    async getSuccessor(index, tree) {
        let current = this.children[index + 1];
        while (!current.isLeaf) {
            await tree.visualizeStep('Finding successor: moving to leftmost child');
            current = current.children[0];
        }
        return current.keys[0];
    }

    async mergeChildren(index, tree) {
        const child = this.children[index];
        const sibling = this.children[index + 1];
        
        await tree.visualizeStep(`Merging nodes at index ${index}`);
        
        child.keys.push(this.keys[index]);
        
        for (let i = 0; i < sibling.keys.length; i++) {
            child.keys.push(sibling.keys[i]);
        }

        if (!child.isLeaf) {
            for (let i = 0; i < sibling.children.length; i++) {
                child.children.push(sibling.children[i]);
            }
        }

        this.keys.splice(index, 1);
        this.children.splice(index + 1, 1);
        
        await tree.visualizeStep('Merge complete');
    }

    async fillChild(index, tree) {
        await tree.visualizeStep(`Ensuring child at index ${index} has enough keys`);
        
        if (index !== 0 && this.children[index - 1].keys.length >= tree.order) {
            await this.borrowFromPrev(index, tree);
        }
        else if (index !== this.keys.length && this.children[index + 1].keys.length >= tree.order) {
            await this.borrowFromNext(index, tree);
        }
        else {
            if (index !== this.keys.length) {
                await this.mergeChildren(index, tree);
            } else {
                await this.mergeChildren(index - 1, tree);
            }
        }
    }
} 