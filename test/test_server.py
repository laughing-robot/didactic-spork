# Python 3 server example
from http.server import BaseHTTPRequestHandler, HTTPServer
import time
import json
import sys
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages

hostName = "localhost"
serverPort = 8080

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(bytes("<html><head><title>Basic Server</title></head>", "utf-8"))
        self.wfile.write(bytes("<body>", "utf-8"))
        self.wfile.write(bytes("<p>This is the testing web server.</p>", "utf-8"))
        self.wfile.write(bytes("</body></html>", "utf-8"))

    def do_POST(self):
        self.send_response(200)
        self.end_headers()
        # form = json.loads(self.rfile.read(10))
        content_len = int(self.headers.get('Content-Length'))
        post_body = json.loads(self.rfile.read(content_len))

        if 'close' in post_body:
            print("Closing...")
            webServer.server_close()
            sys.exit()
        else:
            self.plot(post_body)
            self.wfile.write(bytes("Success", "utf-8"))


    def plot(self, post_body):
        plt.axes()

        rectangles = []

        title = post_body['title']
        del post_body['title']



        with PdfPages('./test/test_results/' + title + '.pdf') as pdf:

            txt = "Rectangles\n";

            for key, sbin in post_body.items():
                mbin = json.loads(sbin)
                binw, binh = mbin['w'], mbin['h']

                plt.gca().set_xlim([0, binw])
                plt.gca().set_ylim([0,binh])

                #print("{} {}".format(binw, binh))

                bigrect = plt.Rectangle((0,0), binw, binh, fc='white', ec='black')
                plt.gca().add_patch(bigrect)
                #plt.gca().autoscale()

                for rect in mbin['placed']:
                    w, h, x0, y0, xe, ye = rect['w'], rect['h'], rect['x0'], rect['y0'], rect['xe'], rect['ye']
                    rectangle = plt.Rectangle((x0, y0), w, h, fc='green', ec='black')

                    #print("{} {} {} {}".format(w, h, x0, y0))
                    plt.gca().add_patch(rectangle)

                    txt += "id: {} w: {} h: {} x0: {} y0: {} xe: {} ye: {}\n".format(rect['id'], w, h, x0, y0, xe, ye);

                plt.title('Bin ' + key)
                plt.figtext(0.5, 0.000, txt, wrap=True, horizontalalignment='center', fontsize=5)

                txt = "Rectangles\n"

                pdf.savefig()
                plt.clf()



if __name__ == "__main__":
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
