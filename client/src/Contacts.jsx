import React, {useEffect, useState} from "react";
import axios from "axios";

const Contacts = () => {
    const [name, setName] = useState("");
    const [contacts, setContacts] = useState([{}]);

    const getPeopleFromDb = async () => {
        let resp = await axios('http://localhost:3001/persons');
        // console.log(resp.data);
        setContacts(resp.data);
    }

    const postPersonToDb = async () => {
        let resp = await axios.post('http://localhost:3001/person',
            {
                name: name
            });
        // console.log('posted to db: ', resp.data);
    }

    useEffect(async () => {
        await getPeopleFromDb();
    }, []);

    function handleChange(e) {
        setName(e.target.value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name !== "") {
            // setContacts([...contacts, name]);
            await postPersonToDb();
            setName("");
            await getPeopleFromDb();
        }
        document.getElementById("input1").focus();
    };

    const listItems = contacts.map((p, index) =>
        <li key={index}>{p.name}</li>
    );


    return (<>
            <h1>Contacts:</h1>
            <form onSubmit={handleSubmit}>
                <input id="input1"
                       type="text"
                       placeholder="Add new contact"
                       onChange={handleChange}
                       value={name}/>
                <button type="submit">Add</button>
                <br/>
            </form>
            <span>
                <ol>
                    <ul>{listItems}</ul>
                </ol>
            </span>
        </>
    );
};

export default Contacts;