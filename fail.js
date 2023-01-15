const isPublished = window.autopilot.isPublishedRevision

if (isPublished) {

    const componentId = window.autopilot.payload.componentId
    const value = window.autopilot.payload.value

    documentServices.components.data.update({ id: componentId, type: 'DESKTOP' }, { 
        text: `<h3 class="font_5">${value} made by ${window.documentServicesModel.userInfo.email} editorModel.isImpersonated: ${window.parent.editorModel.isImpersonated}</h3>` 
    })
    
    window.autopilot.reportResult('published revision migration worked')
} else {
    window.autopilot.reportError(new Error('saved migration failed'))
}