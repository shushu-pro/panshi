// require.config({ paths: { 'vs': '/monaco-editor@0.21.2/min/vs' }});
//       // Before loading vs/editor/editor.main, define a global MonacoEnvironment that overwrites
//       // the default worker url location (used when creating WebWorkers). The problem here is that
//       // HTML5 does not allow cross-domain web workers, so we need to proxy the instantiation of
//       // a web worker through a same-domain script
//       window.MonacoEnvironment = {
//         getWorkerUrl: function(workerId, label) {
//           return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
//             self.MonacoEnvironment = {
//               baseUrl: '/monaco-editor@0.21.2/min/'
//             };
//             importScripts('/monaco-editor@0.21.2/min/vs/base/worker/workerMain.js');`
//           )}`;
//         }
//       };

    //   require(["vs/editor/editor.main"], function () {
    //     // ...
    //   });

require.config({ paths: { 'vs': '/monaco-editor@0.21.2/min/vs' }});
// require(['vs/editor/editor.main'], function() {

// 	//console.info({monaco})
// 	// var editor = monaco.editor.create(document.body), {
// 	// 	value:'xxxx',
// 	// 	language: 'javascript'
// 	// });
// });