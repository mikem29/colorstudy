document.addEventListener('DOMContentLoaded', function() {
    console.log('Mixer Slider: DOM fully loaded and script initialized.');

    const sliders = document.querySelectorAll('.slider');

    // Initialize all sliders
    initializeSliders();

    /**
     * Initialize all slider elements using noUiSlider
     */
    function initializeSliders() {
        console.log(`Mixer Slider: Initializing ${sliders.length} slider(s).`);

        sliders.forEach((slider, index) => {
            try {
                console.log(`Initializing slider ${index + 1}/${sliders.length} with id: ${slider.id}`);

                // Initialize the slider with noUiSlider
                noUiSlider.create(slider, {
                    start: 0,
                    connect: [true, false],
                    step: 1,
                    range: {
                        'min': 0,
                        'max': 100
                    },
                    tooltips: true,
                    format: wNumb({
                        decimals: 0
                    })
                });

            } catch (error) {
                console.error(`Error initializing slider with id ${slider.id}:`, error);
            }
        });
    }
});
