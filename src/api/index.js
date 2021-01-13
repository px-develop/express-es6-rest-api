import { version } from '../../package.json'
import { Router } from 'express'
// import facets from './facets';
const APPID = 1257

export default ({ config, client }) => {
	let api = Router()

	// mount the facets resource
	// api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/demo', (req, res) => {
		res.json({ version })
	})

	api.get('/records', (req, res, next) => {
		;(async () => {
			const records = await client.record.getRecords({ app: APPID })
			res.status(200).json(records)
		})().catch(next)
	})

	return api
}
