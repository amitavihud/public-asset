
try {
    window.autopilot.log('start script')

    const isPublished = window.autopilot.isPublishedRevision

    const componentId = window.autopilot.payload.componentId
    const value = window.autopilot.payload.value

    window.autopilot.log('updating component label')

    documentServices.components.data.update({ id: componentId, type: 'DESKTOP' }, { text: `<h3 class="font_5">${value} made by ${window.documentServicesModel.userInfo.email}</h3>`})
    
    window.autopilot.log('end script')

    
    window.autopilot.reportResult(`This was a simple jsonp migration on the ${isPublished ? 'published' : 'last saved'} revision`)
} catch (e) {
    window.autopilot.reportError(e)
}

