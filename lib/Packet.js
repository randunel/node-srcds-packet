module.exports = {
    buildRequest: function(data) {
        if(data.length < Request.MAX_SIZE) {
            return buildSingleRequest(data);
        }
        buildMultiRequest(data);
    },
    decodeResponse: function(buffer) {
        return new Response(buffer);
    },
    Request: Request
};

function buildSingleRequest(data) {
    return new Request( {
        header: Request.HEADER_SINGLE,
        payload: data
    });
}

function Request(options) {
    this.header = options.header;
    // TODO: add this.id, this.size, etc etc
    this.payload = options.payload;
    this.buffer = new Buffer(this.payload.length + 4 + 2);
    this.buffer.writeInt32LE(this.header, 0);
    if(typeof(this.payload) == 'string') {
        this.buffer.write(this.payload, 4, this.buffer.length - 2, 'ascii');
    }
    else {
        this.payload.copy(this.buffer, 4, 0, this.payload.length);
    }
    this.buffer.writeInt16LE(0x00, this.buffer.length - 2);
}

Request.MAX_SIZE = 1400;
Request.HEADER_SINGLE = -1;
Request.HEADER_MULTI = -2;

function Response(buffer) {
    this.buffer = buffer;
    this.header = buffer.readInt32LE(0);
    this.multi = this.header == Response.HEADER_MULTI;
    if(this.multi) {
        this.id = buffer.readInt32LE(4);
        this.total = buffer.readInt8(8);
        this.number = buffer.readInt8(9);
        this.size = buffer.readInt16LE(10);
        // TODO: handle bzip compression
        this.payload = new Buffer(buffer.length - 12);
    }
    else {
        this.payload = new Buffer(buffer.length - 4);
    }
    buffer.copy(this.payload, 0, this.multi ? 12 : 4, buffer.length);
}

Response.HEADER_SINGLE = -1;
Response.HEADER_MULTI = -2;

