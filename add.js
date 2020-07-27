
try {
    if (window.autopilot.payload.throwErrorMessage) {
        throw new Error(window.autopilot.payload.throwErrorMessage)
    }

    const data = documentServices.components.data.get({id: window.autopilot.payload.componentId, type: 'DESKTOP' })
    documentServices.components.data.update(
        {id: window.autopilot.payload.componentId, type: 'DESKTOP'},
        {
            ...data,
            text: '<h3 class="font_5">' + window.autopilot.payload.value + '</h3>',
        }
    )
    
    window.autopilot.jsonp({
        migratedPages: [documentServices.pages.getCurrentPage()],
        isPublished: window.autopilot.isPublishedRevision
    })
} catch (e) {
    window.autopilot.jsonp(null, e)
}

