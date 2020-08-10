const Command = require('./Command.js');
const canvas = require('canvas');
const { Canvas, CanvasRenderingContext2D } = canvas;
const { MessageAttachment } = require("discord.js");
const { oneLine } = require("common-tags");

/**
 * @typedef {1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 | 121 | 122 | 123 | 124 | 125 | 126 | 127 | 128 | 129 | 130 | 131 | 132 | 133 | 134 | 135 | 136 | 137 | 138 | 139 | 140 | 141 | 142 | 143 | 144 | 145 | 146 | 147 | 148 | 149 | 150 | 151 | 152 | 153 | 154 | 155 | 156 | 157 | 158 | 159 | 160 | 161 | 162 | 163 | 164 | 165 | 166 | 167 | 168 | 169 | 170 | 171 | 172 | 173 | 174 | 175 | 176 | 177 | 178 | 179 | 180 | 181 | 182 | 183 | 184 | 185 | 186 | 187 | 188 | 189 | 190 | 191 | 192 | 193 | 194 | 195 | 196 | 197 | 198 | 199 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 210 | 211 | 212 | 213 | 214 | 215 | 216 | 217 | 218 | 219 | 220 | 221 | 222 | 223 | 224 | 225 | 226 | 227 | 228 | 229 | 230 | 231 | 232 | 233 | 234 | 235 | 236 | 237 | 238 | 239 | 240 | 241 | 242 | 243 | 244 | 245 | 246 | 247 | 248 | 249 | 250 | 251 | 252 | 253 | 254 | 255} Int8
 */

module.exports = class ImageCommand extends Command {
	constructor(client, opts) {
        (opts.args = opts.args || []).unshift({
            key: "context",
            type: "imgcontext",
            label: "...user|...url",
            prompt: "",
            default: ""
        });
        opts.formatExplanation = {
            "[...user|...url]": oneLine`A space separated list of links or usernames.
            If nothing is specified, then the last image will be used instead.`,
            ...(opts.formatExplanation || {})
        }
        opts.details = opts.details || `commands/images:DETAILS`
        super(client, opts);
        this.line = opts.line;
    }
    
    async run(message, args) {
        const { context: { canvas: cvs, ctx } } = args;

        await this.operate(message, args, cvs, ctx);

        let buf = cvs.toBuffer('image/png');
        let att = new MessageAttachment(buf, "image.png");

        return message.channel.send(this.line, att);
    }

    /**
     * @param {any} msg 
     * @param {Object} args 
     * @param {Canvas} canvas 
     * @param {CanvasRenderingContext2D} ctx
     * @return {void | Promise<void>}
     */
    operate(msg, args, canvas, ctx) {}

	largestSize(images) {
        return this.client.utils.largestSize(images);
    }

	greyscale(ctx, unbluered=false, x=0, y=0, width=null, height=null) {
		if (width == null)
			width = ctx.width;

		if (height == null)
			height = ctx.height;

		const data = ctx.getImageData(x, y, width, height);
		let brightness;

		for (let i = 0; i < data.data.length; i += 4) {
			if (!unbluered)
				brightness = (0.34 * data.data[i]) + (0.5 * data.data[i + 1]) + (0.16 * data.data[i + 2]);
			else
				brightness = (0.2126 * data.data[i]) + (0.7152 * data.data[i + 1]) + (0.0722 * data.data[i + 2]);

			data.data[i] = data.data[i + 1] = data.data[i + 2] = brightness;
        }
		ctx.putImageData(data, x, y);
		return ctx;
	}

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx The rendering context
     * @param {Int8} threshold The threshold
     * @param {number} [x] The X of the image
     * @param {number} [y] The Y of the image
     * @param {number} [width] The width of the image
     * @param {number} [height] The height of the image
     */
	threshold(ctx, threshold, x=0, y=0, width=null, height=null) {
		if (width == null)
			width = ctx.width;

		if (height == null)
			height = ctx.height;

		const data = ctx.getImageData(x, y, width, height);
		let changedValue;

		for (let i = 0; i < data.data.length; i += 4) {
			changedValue = (((0.2126 * data.data[i]) + (0.7152 * data.data[i + 1]) + (0.0722 * data.data[i + 2])) >= threshold) ? 255 : 0;
			data.data[i] = data.data[i + 1] = data.data[i + 2] = changedValue;
		}

		ctx.putImageData(data, x, y);
		return ctx;
	}

	invert(ctx, x=0, y=0, width=null, height=null) {
		if (width == null)
			width = ctx.width;

		if (height == null)
			height = ctx.height;

		const data = ctx.getImageData(x, y, width, height);
		for (let i = 0; i < data.data.length; i += 4) {
			data.data[i] = 255 - data.data[i];
			data.data[i + 1] = 255 - data.data[i + 1];
			data.data[i + 2] = 255 - data.data[i + 2];
		}

		ctx.putImageData(data, x, y);
		return ctx;
	}

	silhouette(ctx, x=0, y=0, width=null, height=null) {
		if (width == null)
			width = ctx.width;

		if (height == null)
			height = ctx.height;

		const data = ctx.getImageData(x, y, width, height);
		for (let i = 0; i < data.data.length; i += 4) {
			data.data[i] = 0;
			data.data[i + 1] = 0;
			data.data[i + 2] = 0;
		}
		ctx.putImageData(data, x, y);
		return ctx;
	}

	sepia(ctx, x=0, y=0, width=null, height=null) {
		if (width == null)
			width = ctx.width;

		if (height == null)
			height = ctx.height;

		const data = ctx.getImageData(x, y, width, height);
		for (let i = 0; i < data.data.length; i += 4) {
			const brightness = (0.34 * data.data[i]) + (0.5 * data.data[i + 1]) + (0.16 * data.data[i + 2]);
			data.data[i] = brightness + 100;
			data.data[i + 1] = brightness + 50;
			data.data[i + 2] = brightness;
		}
		ctx.putImageData(data, x, y);
		return ctx;
	}

	contrast(ctx, x, y, width, height) {
		const data = ctx.getImageData(x, y, width, height);
		const factor = (259 / 100) + 1;
		const intercept = 128 * (1 - factor);
		for (let i = 0; i < data.data.length; i += 4) {
			data.data[i] = (data.data[i] * factor) + intercept;
			data.data[i + 1] = (data.data[i + 1] * factor) + intercept;
			data.data[i + 2] = (data.data[i + 2] * factor) + intercept;
		}
		ctx.putImageData(data, x, y);
		return ctx;
	}

	distort(ctx, amplitude, x, y, width, height, strideLevel = 4) {
		const data = ctx.getImageData(x, y, width, height);
		const temp = ctx.getImageData(x, y, width, height);
		const stride = width * strideLevel;
		for (let i = 0; i < width; i++) {
			for (let j = 0; j < height; j++) {
				const xs = Math.round(amplitude * Math.sin(2 * Math.PI * 3 * (j / height)));
				const ys = Math.round(amplitude * Math.cos(2 * Math.PI * 3 * (i / width)));
				const dest = (j * stride) + (i * strideLevel);
				const src = ((j + ys) * stride) + ((i + xs) * strideLevel);
				data.data[dest] = temp.data[src];
				data.data[dest + 1] = temp.data[src + 1];
				data.data[dest + 2] = temp.data[src + 2];
			}
		}
		ctx.putImageData(data, x, y);
		return ctx;
	}

	drawImageWithTint(ctx, image, color, x, y, width, height) {
		const { fillStyle, globalAlpha } = ctx;
		ctx.fillStyle = color;
		ctx.drawImage(image, x, y, width, height);
		ctx.globalAlpha = 0.5;
		ctx.fillRect(x, y, width, height);
		ctx.fillStyle = fillStyle;
		ctx.globalAlpha = globalAlpha;
	}

	shortenText(ctx, text, maxWidth) {
		let shorten = false;
		while (ctx.measureText(text).width > maxWidth) {
			if (!shorten) shorten = true;
			text = text.substr(0, text.length - 1);
		}
		return shorten ? `${text}...` : text;
	}

	wrapText(ctx, text, maxWidth) {
		return new Promise(resolve => {
			if (ctx.measureText(text).width < maxWidth) return resolve([text]);
			if (ctx.measureText('W').width > maxWidth) return resolve(null);
			const words = text.split(' ');
			const lines = [];
			let line = '';
			while (words.length > 0) {
				let split = false;
				while (ctx.measureText(words[0]).width >= maxWidth) {
					const temp = words[0];
					words[0] = temp.slice(0, -1);
					if (split) {
						words[1] = `${temp.slice(-1)}${words[1]}`;
					} else {
						split = true;
						words.splice(1, 0, temp.slice(-1));
					}
				}
				if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
					line += `${words.shift()} `;
				} else {
					lines.push(line.trim());
					line = '';
				}
				if (words.length === 0) lines.push(line.trim());
			}
			return resolve(lines);
		});
	}
}
