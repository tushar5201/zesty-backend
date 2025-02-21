let adminSocket = null;

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("new client connected : ", socket.id);
        socket.on("admin_join", () => {
            adminSocket = socket;
            console.log("admin is connected : ", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
            if (socket === adminSocket) {
                adminSocket = null;
            }
        });
    })
}

const sendToAdmin = (data) => {
    if (adminSocket) {
        console.log("received by socket");
        
        adminSocket.emit("new_restaurant", data);
    }
}

module.exports = { socketHandler, sendToAdmin };