import {eq} from "drizzle-orm";
import {z} from "zod";
import {defineHandler} from "nitro";
import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {usePostObject, withPreparsedForm} from "~/utils/usePostObject";
import {
    gdpsFullRaterCustomDifficultiesTable,
    levelsTable,
} from "~~/drizzle";

const tierNames: Record<string, string> = {
    "auto": "Auto",
    "easy": "Easy",
    "normal": "Normal",
    "hard": "Hard",
    "harder": "Harder",
    "insane": "Insane",
    "easy-demon": "Easy Demon",
    "medium-demon": "Medium Demon",
    "hard-demon": "Hard Demon",
    "insane-demon": "Insane Demon",
    "extreme-demon": "Extreme Demon",
    "free-demon": "Free Demon",
    "peaceful-demon": "Peaceful Demon",
    "simple-demon": "Simple Demon",
    "casual-demon": "Casual Demon",
    "mild-demon": "Mild Demon",
    "moderate-demon": "Moderate Demon",
    "tricky-demon": "Tricky Demon",
    "tough-demon": "Tough Demon",
    "wild-demon": "Wild Demon",
    "cruel-demon": "Cruel Demon",
    "crazy-demon": "Crazy Demon",
    "bizarre-demon": "Bizarre Demon",
    "brutal-demon": "Brutal Demon",
    "supreme-demon": "Supreme Demon",
    "ultimate-demon": "Ultimate Demon",
    "legendary-demon": "Legendary Demon",
    "mythical-demon": "Mythical Demon",
    "infinite-demon": "Infinite Demon",
    "grandpa-demon": "Grandpa Demon",
    "unrated": "Remove custom rating",
};

const requestSchema = z.object({
    levelID: z.coerce.number().int().positive(),
    tier: z.string().refine(
        (value) => Object.prototype.hasOwnProperty.call(tierNames, value),
        "Unknown custom difficulty tier",
    ),
});

export default defineHandler({
    middleware: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(
            await withPreparsedForm(event),
        );
        const {data, success} = requestSchema.safeParse(post);

        if (!success) {
            return {ok: false, code: "BAD_REQUEST"};
        }

        const user = event.context.user!;
        const role = await user.fetchRole();

        if (!role?.privileges.aRateDemon) {
            return {ok: false, code: "UNAUTHORIZED"};
        }

        const level = await event.context.drizzle.query.levelsTable.findFirst({
            where: eq(levelsTable.id, data.levelID),
        });

        if (!level) {
            return {ok: false, code: "LEVEL_NOT_FOUND"};
        }

        if (data.tier === "unrated") {
            await event.context.drizzle
                .delete(gdpsFullRaterCustomDifficultiesTable)
                .where(eq(gdpsFullRaterCustomDifficultiesTable.levelId, data.levelID));

            return {ok: true, code: "CUSTOM_TIER_REMOVED"};
        }

        const tierName = tierNames[data.tier];

        await event.context.drizzle
            .insert(gdpsFullRaterCustomDifficultiesTable)
            .values({
                levelId: data.levelID,
                tierKey: data.tier,
                tierName,
                ratedBy: user.$.uid,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: gdpsFullRaterCustomDifficultiesTable.levelId,
                set: {
                    tierKey: data.tier,
                    tierName,
                    ratedBy: user.$.uid,
                    updatedAt: new Date(),
                },
            });

        return {
            ok: true,
            code: "CUSTOM_TIER_SAVED",
            key: data.tier,
            tierName,
        };
    },
});