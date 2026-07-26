import "dotenv/config";
import app from './app.js'
import { env } from './config/env.js'
import { connectDb } from './database/connect-db.js'
const PORT = env.PORT || 3000

const bootstrap = async () => {

    try {
        await connectDb()

        app.listen(
            PORT,
            () => console.log(`server is running http://localhost:${PORT}/api/v1/health`)
        );
    } catch (error) {
        console.error("failed to start the server", error);
        process.exit(1);
    }
}

bootstrap();

