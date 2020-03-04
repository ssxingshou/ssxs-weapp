Component({
    options: {
        multipleSlots: true
    },

    properties: {
        isCurent: {
            type: Boolean,
            value: false
        },
        isShowLeftLine: {
            type: Boolean,
            value: true
        },
        axisTitle: {
            type: String,
            value: ''
        },
        axisTime: {
            type: String,
            value: ''
        },
        textArray: {
            type: Array,
            value: []
        }

    },

    data: {

    },
    ready() {
        console.log(this.data.textArray)
    },

    methods: {

    }
})
