const Page = require('./helpers/page')

let page

beforeEach(async () => {

       page = await Page.build()
    await page.goto('http://localhost:3000')
})

afterEach(async () => {
    await page.close()
})


describe('When logged in', async () => {
    beforeEach(async () => {
        await page.login()
        await page.click('a.btn-floating')
    })


    it('When loged in, can see blog create form', async () => {
        const label = await page.getContentsOf('form label')
    
        expect(label).toBe('Blog Title')
    })

    describe('And using valid inputs', async () => {

        beforeEach(async () => {
            await page.type('.title input', 'Test Blog')
            await page.type('.content input', 'This is a test blog')
            await page.click('form button')
        })

        test('Submitting takes user to the review screen', async () => {
            const text = await page.getContentsOf('h5')
            expect(text).toEqual('Please confirm your entries')
        })
        
        test('Submitting then saving adds blogs to the index page', async () => {
            await page.click('button.green')
            await page.waitFor('.card')

            const title = await page.getContentsOf('.card-title')
            const content = await page.getContentsOf('p')
            
            expect(title).toEqual('Test Blog')
            expect(content).toEqual('This is a test blog')

        })

    })
    describe('And using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button')
        })

        test('The form shows an error message', async () => {

            const titleErrorMessage = await page.getContentsOf('.title .red-text')
            const contentErrorMessage = await page.getContentsOf('.content .red-text')

            expect(titleErrorMessage).toBe('You must provide a value')
            expect(contentErrorMessage).toBe('You must provide a value')
        })
    })
})

describe('When logged out', async () => {

    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'Test Blog',
                content: 'This is a test blog'
            }
        }
    ]

    test('Blog related action are prohibited', async() => {
        const results = await page.executeRequests(actions)
        
        for (const result of results) {
            expect(result.error).toEqual('You must log in!')
        }
    })

    // test('User cannot create blog post', async () => {
    //     const result = await page.post('/api/blogs/', {
    //         title: 'Test Blog',
    //         content: 'This is a test blog'
    //     })
        
    //     expect(result.error).toEqual('You must log in!')
    // })

    // test('User cannot view blog post', async () => {
    //     const result = await page.get('/api/blogs')

    //     expect(result.error).toEqual('You must log in!')
    // })
})