import { PierRealm } from './realms';
import Scenario from './Scenario';

const RingoScenario: Scenario = {
	description: 'Play as Ringo, the hapless drummer.',
	player: 'player.ringo',
	realm: PierRealm,
	inventory: ['item.dagger'],
};

const scenarios: { [key: string]: Scenario } = {
	r: RingoScenario,
};
export default scenarios;

export const scenarioDescriptions: { [key: string]: string } = {};
Object.entries(scenarios).forEach(([key, val]) => {
	scenarioDescriptions[key] = val.description;
});
