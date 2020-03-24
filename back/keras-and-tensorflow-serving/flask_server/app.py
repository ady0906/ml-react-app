import base64
import json
import os
import cv2
import requests
import string
import operator
import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt

from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from keras import backend as K
from keras.utils import to_categorical
from keras.models import Sequential, load_model
from keras.layers import Dense, Conv2D, Dropout, Flatten, MaxPooling2D,LSTM
from keras.losses import categorical_crossentropy
from keras.optimizers import Adadelta
from keras.applications import inception_v3
from keras.preprocessing import image
from PIL import Image
from PIL import ImageFilter

global graph
global sess

tf_config = []
sess = tf.Session()
graph = tf.get_default_graph()

K.set_session(sess)
model = load_model("/mnt/c/Users/USER/Downloads/LETTERS-letters-digits-new-2.h5")

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'

cors = CORS(app)

symbols = "0123456789" + string.ascii_uppercase + string.ascii_lowercase
mon_dictionnaire = {}

for i in range(len(symbols)):
    mon_dictionnaire[i]=symbols[i]


def imageprepare(argv):
    img = Image.open(BytesIO(argv))
    img = img.convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        if item[0] == 0 and item[1] == 0 and item[2] == 0:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    image = np.asarray(img)
    height, width, depth = image.shape

    # resizing the image to better find spaces
    image = cv2.resize(image, dsize=(width*5,height*4), interpolation=cv2.INTER_CUBIC)

    # grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # binary
    ret, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)

    # dilation
    kernel = np.ones((5, 5), np.uint8)
    img_dilation = cv2.dilate(thresh, kernel, iterations=1)

    # adding GaussianBlur
    gsblur=cv2.GaussianBlur(img_dilation, (5, 5), 0)

    # find contours
    ctrs, hier = cv2.findContours(gsblur.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # sort contours
    sorted_ctrs = sorted(ctrs, key=lambda ctr: cv2.boundingRect(ctr)[0])
    dp = image.copy()

    final = []
    for i, ctr in enumerate(sorted_ctrs):
        # Get bounding box
        x, y, w, h = cv2.boundingRect(ctr)

        temp = image[y - 70: y + h + 70, x - 70: x + w + 70]
        temp = cv2.resize(temp, dsize=(28, 28), interpolation = cv2.INTER_AREA)
        temp = cv2.cvtColor(temp, cv2.COLOR_BGR2GRAY) / 255
        temp = np.array(temp)

        t = np.copy(temp)
        t = 1 - t
        t = t.reshape(1, 28, 28, 1)

        prediction_tuples = best5(t)
        predictions_list = [list(elem) for elem in prediction_tuples]
        final.append(predictions_list)

    return final

# Prediction function
def best5(image):
    K.clear_session()

    with graph.as_default():
        K.set_session(sess)
        test = model.predict(image)

    prediction = {}
    for i,j in enumerate(symbols):
        prediction[j] = test[0][i]

    return sorted(prediction.items(), key=operator.itemgetter(1), reverse=True)[:5]


# Testing URL
@app.route('/hello/', methods=['GET', 'POST'])
def hello_world():
    return 'Hello, World!'

@app.route('/prediction/', methods=['GET', 'POST'])
@cross_origin()
def prediction():
    if request.method == 'POST':
        imgstr = request.json
        imgdata = base64.b64decode(imgstr[22:])
        prediction = imageprepare(imgdata)

        data = {"prediction": prediction}
        response = json.dumps(str(data))

        return response
