export const basicModelInfo = `\
A basic neural network. \
The model receives your drawing as a list of 784 (28 by 28) pixels, \
with values ranging from 0 (black) to 1 (white). \
The pixels are then sent through a layer of 128 "neurons" that have learned to identify \
basic relationships between the drawing's pixels. \
Finally, the data is sent through a layer of 10 "neurons" (one for every numerical digit), \
with each representing the likelihood that the drawing is a given digit.\
`
export const lenet5Info = `\
One of the earliest convolutional neural networks. \
The model contains multiple convolutional layers, which allow the network to identify patterns \
occurring in small sections of the image. Then, the model uses layers similar to the basic neural network, \
distilling the patterns into 10 possible categories - one for each digit. \
The model's additional layers results in greater accuracy than the basic neural network.\
`
export const advancedModelInfo = `\
An advanced convolutional neural network. \
A similar model to LeNet-5, but with additional layers and more advanced features.\
`

export const modelInfo = {
  "Basic Neural Net": basicModelInfo,
  "LeNet-5": lenet5Info,
  "Advanced CNN": advancedModelInfo
}