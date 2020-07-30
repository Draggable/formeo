const loaderBg = document.getElementById('hider') || Object.assign(document.createElement('div'), { id: 'hider' })
const loaderIm = document.getElementById('loadermodaldiv') || Object.assign(document.createElement('div'), { id: 'loadermodaldiv' })

const isformRendered = document.querySelectorAll('.form-rendered')

const onLoadRender = (renderer, FormJson) => {

	if(isformRendered.length !== 0) {
		loaderBg.style.display = 'block'
		loaderIm.style.display = 'block'

		try {
			renderer.render(JSON.parse(FormJson))
		}
		catch(err) {
			document.location.reload();
		}

		if(document.querySelectorAll('.render-form').innerHtml !== ''){
			loaderBg.style.display = 'none'
			loaderIm.style.display = 'none'
		}
	}
}

export default onLoadRender
