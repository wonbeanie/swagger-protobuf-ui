const express = require('express');
const cors = require('cors');

// 1. 컴파일된 proto.bundle.js 파일을 불러옵니다.
// deepObj.proto에 정의된 메시지(User, Address, Tag)가 들어있습니다.
const {proto : messages} = require('./proto/proto.bundle.js');

const app = express();
const port = 3000;

app.use(cors());

// Protobuf 바이너리 요청 본문을 Buffer로 받기 위한 설정
app.use(express.raw({ type: 'application/protobuf', limit: '1mb' }));

// 메모리 DB
let users = [
    {
        id: 1,
        name: 'Alice',
        mainAddress: { street: '123 Main St', city: 'Anytown', zipCode: '12345' },
        tags: [{ id: 101, name: 'friend' }, { id: 102, name: 'developer' }]
    },
    {
        id: 2,
        name: 'Bob',
        mainAddress: { street: '456 Oak Ave', city: 'Someville', zipCode: '67890' },
        tags: [{ id: 103, name: 'colleague' }]
    },
];
let nextId = 3;
let nextTagId = 104;

// ## POST /users (Protobuf 요청/응답)
app.post('/users', (req, res) => {
    try {
        // 2. 요청 본문(Buffer)으로부터 User 메시지를 역직렬화(디코딩)합니다.
        const userRequest = messages.User.deserializeBinary(req.body);

        // 3. 메시지 객체에서 데이터를 가져옵니다.
        const name = userRequest.getName();
        const mainAddressReq = userRequest.getMainAddress();
        const tagsReqList = userRequest.getTagsList();

        if (!name || !mainAddressReq) {
            return res.status(400).send('Name and mainAddress are required.');
        }

        const newUser = {
            id: nextId++,
            name: name,
            mainAddress: {
                street: mainAddressReq.getStreet(),
                city: mainAddressReq.getCity(),
                zipCode: mainAddressReq.getZipCode()
            },
            tags: tagsReqList.map(tag => ({
                id: tag.getId() > 0 ? tag.getId() : nextTagId++,
                name: tag.getName()
            }))
        };
        users.push(newUser);
        console.log('✅ New user created:', newUser);

        // 4. 응답으로 보낼 새로운 User 메시지 객체를 만듭니다.
        const userResponse = new messages.User();
        userResponse.setId(newUser.id);
        userResponse.setName(newUser.name);

        const addressResponse = new messages.Address();
        addressResponse.setStreet(newUser.mainAddress.street);
        addressResponse.setCity(newUser.mainAddress.city);
        addressResponse.setZipCode(newUser.mainAddress.zipCode);
        userResponse.setMainAddress(addressResponse);

        newUser.tags.forEach(tagData => {
            const tagResponse = new messages.Tag();
            tagResponse.setId(tagData.id);
            tagResponse.setName(tagData.name);
            userResponse.addTags(tagResponse);
        });


        // 5. 메시지 객체를 바이너리 데이터(Uint8Array)로 직렬화(인코딩)합니다.
        const buffer = userResponse.serializeBinary();

        res.setHeader('Content-Type', 'application/protobuf');
        res.status(201).send(Buffer.from(buffer)); // Uint8Array를 Buffer로 변환하여 전송

    } catch (err) {
        console.error('Failed to process request:', err);
        return res.status(400).send('Invalid Protobuf format.');
    }
});

// GET 엔드포인트도 추가해봅시다.
app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));

    if (!user) {
        return res.status(404).send('User not found');
    }

    const userResponse = new messages.User();
    userResponse.setId(user.id);
    userResponse.setName(user.name);

    const addressResponse = new messages.Address();
    addressResponse.setStreet(user.mainAddress.street);
    addressResponse.setCity(user.mainAddress.city);
    addressResponse.setZipCode(user.mainAddress.zipCode);
    userResponse.setMainAddress(addressResponse);

    user.tags.forEach(tagData => {
        const tagResponse = new messages.Tag();
        tagResponse.setId(tagData.id);
        tagResponse.setName(tagData.name);
        userResponse.addTags(tagResponse);
    });

    const buffer = userResponse.serializeBinary();
    res.setHeader('Content-Type', 'application/protobuf');
    res.send(Buffer.from(buffer));
});

app.get('/users/:id/info', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));

    if (!user) {
        return res.status(404).send('User not found');
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(user);
});

app.listen(port, () => {
    console.log(`✅ Server with google-protobuf is running at http://localhost:${port}`);
});
