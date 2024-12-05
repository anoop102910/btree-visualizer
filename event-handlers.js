document.getElementById("deleteButton").addEventListener("click", async () => {
    if (!bTree) {
        alert("Please initialize the tree first!");
        return;
    }

    const value = parseInt(document.getElementById("deleteInput").value);
    if (!isNaN(value)) {
        document.getElementById("deleteButton").disabled = true;
        await bTree.delete(value);
        document.getElementById("deleteButton").disabled = false;
        document.getElementById("deleteInput").value = "";
    }
}); 