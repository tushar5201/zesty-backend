let adminSocket = null;
let userSockets = {};
let restaurantSockets = {};

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("new client connected : ", socket.id);
        socket.on("admin_join", () => {
            adminSocket = socket;
            console.log("admin is connected : ", socket.id);
        });

        socket.on("user_join", (userId) => {
            userSockets[userId] = socket;
            console.log(`User ${userId}  is connected: `, socket.id);
        });

        socket.on("restaurant_join", (restaurantId) => {
            restaurantSockets[restaurantId] = socket;
            console.log(`restaurant ${restaurantId} is connected: `, socket.id);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
            if (socket === adminSocket) {
                adminSocket = null;
            }

            for (const [userId, userSocket] of Object.entries(userSockets)) {
                if (userSocket === socket) {
                    delete userSockets[userId];
                    console.log(`User ${userId} disconnected`);
                }
            }

            for (const [restaurantId, restaurantSocket] of Object.entries(restaurantSockets)) {
                if(restaurantSocket === socket) {
                    delete restaurantSockets[restaurantId];
                    console.log(`Restaurant ${restaurantId} disconnected`);
                }
            }
        });
    });
}

const sendToAdmin = (data) => {
    if (adminSocket) {
        adminSocket.emit("new_restaurant", data);
    }
}

const sendOrderToRestaurant = (restaurantId, data) => {
    if (restaurantSockets[restaurantId]) {
        restaurantSockets[restaurantId].emit("new_order", data);
    }
}

const sendOrderToUser = (userId, data) => {
    if (userSockets[userId]) {
        userSockets[userId].emit("order", data);
    }
}

module.exports = { socketHandler, sendToAdmin, sendOrderToRestaurant, sendOrderToUser };