from sys import argv
from PIL import Image


background_color = (166, 202, 240, 255)


def output_result():
    file = open('output.txt', 'w')


def parse(id, ext):
    try:
        image = Image.open(id + '.' + ext)
        print(image.mode)
        # if image.mode != 'rgb':
        #     image = image.convert('rgb')

        cropped = crop_image(image)
        cropped.show()
        result = parse_image(cropped)

        return result
    except IOError:
        pass


def crop_image(image):
    width = image.width
    height = image.height

    left = -1
    right = 0
    top = -1
    bottom = 0

    columns = [0]*width
    rows = [0]*height

    image2 = Image.new(mode="RGB", size=(image.width, image.height))

    for x in range(width):
        for y in range(height):
            pixel = image.getpixel((x, y))
            # print(pixel)
            if (pixel == background_color):
                columns[x] += 1
                rows[y] += 1
                image2.putpixel((x,y), (255,255,255))

    for x in range(width):
        if (columns[x] <= 10):
            continue
        right = x
        if left < 0:
            left = x

    for y in range(height):
        if (columns[y] <= 10):
            continue
        bottom = y
        if top < 0:
            top = y

    image2.show()
    return image.crop((left, top, right, bottom))

def parse_image(image):

    foo = 1


def image_to_text(image):

    foo = 1


def main():

    if len(argv) <= 2:
        output_result('missing arguments')
        return

    id = argv[1]
    extension = argv[2]

    result = parse(id, extension)
    if result == None:
        return


if (__name__ == '__main__'):
    main()
