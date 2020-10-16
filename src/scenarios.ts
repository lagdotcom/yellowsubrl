import { RingoPrefab } from './features/players';
import { dagger } from './items/equipment';
import { PierRealm } from './realms';
import Scenario from './Scenario';

const RingoScenario: Scenario = {
	description: 'Play as Ringo, the hapless drummer.',
	player: RingoPrefab,
	realm: PierRealm,
	inventory: [dagger],
};

const scenarios: { [key: string]: Scenario } = {
	r: RingoScenario,
};
export default scenarios;

export const scenarioDescriptions: { [key: string]: string } = {};
Object.entries(scenarios).forEach(([key, val]) => {
	scenarioDescriptions[key] = val.description;
});
