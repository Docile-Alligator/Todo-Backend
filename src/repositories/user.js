export default (db) => {
    const { USER_COLLECTION } = process.env;
    const collection = db.collection(USER_COLLECTION);

    async function findOneById(userID) {
        return await collection.findOne({
            userID
        });
    }

    async function findOneByUsername(username) {
        return await collection.findOne({
            username
        });
    }

    async function createIfNotExists(user) {
        const result = await collection.findOneAndUpdate({
                username: user.username
            },
            {
                $setOnInsert: user,
                $set: {}
            },
            {
                collation: { locale: 'en', strength: 2 },
                upsert: true,
                returnDocument: "after"
            });
        return result;
    }

    return {
        findOneById,
        findOneByUsername,
        createIfNotExists
    };
};