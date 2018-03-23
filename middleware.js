module.exports.eventContext = options => (req, res, next) => {
    options = options || {} // defaults: {reqPropKey: 'apiGateway', deleteHeaders: true}
    const reqPropKey = options.reqPropKey || 'apiGateway'
    const deleteHeaders = options.deleteHeaders === undefined ? true : options.deleteHeaders

    if (!req.headers['x-apigateway-event'] || !req.headers['x-apigateway-context']) {
        console.error('Missing x-apigateway-event or x-apigateway-context header(s)')
        next()
        return
    }

    req[reqPropKey] = {
        event: JSON.parse(decodeURIComponent(req.headers['x-apigateway-event'])),
        context: JSON.parse(decodeURIComponent(req.headers['x-apigateway-context']))
    }

    if (deleteHeaders) {
        delete req.headers['x-apigateway-event']
        delete req.headers['x-apigateway-context']
    }

    next()
}

module.exports.customDomainReroute = (req,res,next) => {
    if (!! req.headers['x-apigateway-event']){
        const event = JSON.parse(decodeURIComponent(req.headers['x-apigateway-event']));
        const params = event.pathParameters || {};
   
        let interpolated_resource = Object.keys(params)
            .reduce((acc, k) => acc.replace('{'+k+'}', params[k]), event.resource)
        
        if ((!! event.path && !! interpolated_resource) && event.path != interpolated_resource){
            req.url = req.originalUrl = interpolated_resource;
            console.log(`rerouted ${event.path} -> ${interpolated_resource}`);
        }
    }
    next()
}