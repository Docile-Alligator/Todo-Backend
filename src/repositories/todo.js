export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    // Find todos that match certain condition and with pagination in mind.
    async function find(userID, before, after, pageSize, otherConditions = {}) {
        let filter;
        let sort;
        let isUsingBefore = false;

        if (after !== 'undefined') {
            // We find a limited number of todos after the created time.
            filter = { userID: userID, created: { $gt: after }, ...otherConditions };
            sort = { created: 1 };
        } else if (before !== 'undefined') {
            /*
                We find a limited number of todos before the created time.
                Notice that we are using sort = { created: -1 } since we need to look up the todos in reverse order,
                otherwise we will always get the first few todos.
             */
            filter = { userID: userID, created: { $lt: before }, ...otherConditions };
            sort = { created: -1 };
            isUsingBefore = true;
        } else {
            // We find a limited number of todos for page 1 (no before or after).
            filter = { userID: userID, ...otherConditions };
            sort = { created: 1 };
        }

        const result = await collection.find(filter)
            .limit(pageSize)
            .sort(sort)
            .toArray();
        /*
            Remember we used sort = { created: -1 } when we fetch todos BEFORE certain created time? Now we need to reverse the list
            so that we can get the list in asc order.
         */
        return isUsingBefore ? result.reverse() : result;
    }

    // Update a todo's certain fields.
    async function updateTodo(todoID, userID, updateFields) {
        return await collection.updateOne(
            {
                todoID: todoID,
                userID: userID
            },
            {
                $set: {
                    ...updateFields
                }
            });
    }

    // Delete a todo.
    async function deleteTodo(todoID, userID) {
        return await collection.deleteOne({
            todoID: todoID,
            userID: userID
        });
    }

    return {
        insertOne,
        find,
        updateTodo,
        deleteTodo
    };
};
