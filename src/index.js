import http from 'http'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
// import initializeDb from './db'
import { kintoneAuth, s3Auth } from './auth'
import middleware from './middleware'
import api from './api'
import config from './config.json'

// HTTPS server
import https from 'https'
import fs from 'fs'
import path from 'path'
const options = {
	key: fs.readFileSync(path.resolve(__dirname, '../ssl/server.key')),
	cert: fs.readFileSync(path.resolve(__dirname, '../ssl/server.crt')),
}

let app = express()
// app.server = http.createServer(app)
app.server = https.createServer(options, app)

// logger
app.use(morgan('dev'))

// 3rd party middleware
app.use(
	cors({
		exposedHeaders: config.corsHeaders,
	})
)

app.use(
	bodyParser.json({
		type: 'application/*+json',
		limit: config.bodyLimit,
	})
)
app.use(
	bodyParser.urlencoded({
		extended: false,
		type: 'application/x-www-form-urlencoded',
	})
)

kintoneAuth((client) => {
	s3Auth(client, (client, s3) => {
		// internal middleware
		app.use(middleware({ config, client, s3 }))

		app.use('/api/v1', api({ config, client, s3 }))
		app.server.listen(process.env.PORT || config.port)
		console.log(`Started on port ${app.server.address().port}`)
	})
})

// auth kintone
// authKintone((client) => {
// 	// internal middleware
// 	app.use(middleware({ config, client }))

// 	app.use('/api/v1', api({ config, client }))
// 	app.server.listen(process.env.PORT || config.port)
// 	console.log(`Started on port ${app.server.address().port}`)
// })

// // connect to db
// initializeDb( db => {

// 	// internal middleware
// 	app.use(middleware({ config, db }));

// 	// api router
// 	app.use('/api', api({ config, db }));

// 	app.server.listen(process.env.PORT || config.port, () => {
// 		console.log(`Started on port ${app.server.address().port}`);
// 	});
// });

export default app
