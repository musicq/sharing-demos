import vm from 'vm'

global.ga = 0
const script = new vm.Script('ga += 1', {filename: 'myfile.vm'})

for (let i = 0; i < 1000; i++) {
  script.runInThisContext()
}

console.log(ga)
