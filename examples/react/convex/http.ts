import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { DataModel } from "./_generated/dataModel";

const http = httpRouter();

authComponent.registerRoutes<DataModel>(http, createAuth, { cors: true });

export default http;
