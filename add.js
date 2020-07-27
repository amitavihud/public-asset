
try {
    const isPublished = window.autopilot.isPublishedRevision

    const componentId = window.autopilot.payload.componentId
    const value = window.autopilot.payload.value

    documentServices.components.data.update(
        {id: componentId, type: 'DESKTOP'},
        {
            ...documentServices.components.data.get({ id: componentId, type: 'DESKTOP' }),
            text: '<h3 class="font_5">' + value + '</h3>',
        }
    )
    
    window.autopilot.jsonp(`This was a simple jsonp migration on the ${isPublished ? 'published' : 'last saved'} revision`)
} catch (e) {
    window.autopilot.jsonp(null, e)
}

