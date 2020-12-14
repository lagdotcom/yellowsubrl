enum RenderOrder {
	Stairs,
	Corpse,
	Item,
	Actor,
}
export default RenderOrder;

export const RenderOrders = {
	Stairs: RenderOrder.Stairs,
	Corpse: RenderOrder.Corpse,
	Item: RenderOrder.Item,
	Actor: RenderOrder.Actor,
};
export type RenderOrderName = keyof typeof RenderOrders;
