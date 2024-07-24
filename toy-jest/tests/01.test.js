const t = new Promise(resolve => setTimeout(resolve, 2000))

t.then(() => {
  expect(1).toBe(2)
})
