import {getQuery} from "h3";
import {eq} from "drizzle-orm";
import {z} from "zod";
import {defineHandler} from "nitro";
import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {
    gdpsFullRaterCustomDifficultiesTable,
    levelsTable,
} from "~~/drizzle";

const requestSchema = z.object({
    levelID: z.coerce.number().int().positive(),
});

export default defineHandler({
    middleware: [initMiddleware],
    handler: async (event) => {
        const {data, success} = requestSchema.safeParse(getQuery(event));

        if (!success) {
            return {ok: false, code: "BAD_REQUEST", key: ""};
        }

        const level = await event.context.drizzle.query.levelsTable.findFirst({
            where: eq(levelsTable.id, data.levelID),
        });

        if (!level) {
            return {ok: false, code: "LEVEL_NOT_FOUND", key: ""};
        }

        const saved = await event.context.drizzle.query.gdpsFullRaterCustomDifficultiesTable.findFirst({
            where: eq(gdpsFullRaterCustomDifficultiesTable.levelId, data.levelID),
        });

        return {
            ok: true,
            key: saved?.tierKey ?? "",
            tierName: saved?.tierName ?? "",
        };
    },
});