import JsonImporter from './importer.js';

function getJsonImporter(config: object = {}) {
	return new JsonImporter(config);
}

export default getJsonImporter;
export { getJsonImporter as 'module.exports' };
