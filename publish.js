new Promise((res, rej) => {
    window.autopilot.log('start script')
    
    const isPublished = window.autopilot.isPublishedRevision
    
    const componentId = window.autopilot.payload.componentId
    const value = window.autopilot.payload.value
    
    window.autopilot.log('updating component label')
    
    documentServices.components.data.update({ 
        id: componentId, type: 'DESKTOP' 
    }, { 
        text: `<h3 class="font_5">${value} made by ${window.documentServicesModel.userInfo.email} editorModel.isImpersonated: ${window.parent.editorModel.isImpersonated}</h3>` 
    })
    window.autopilot.log('end script')

    documentServices.publish(() => res('publish worked'), rej)
}).then(window.autopilot.reportResult).catch(window.autopilot.reportError)
