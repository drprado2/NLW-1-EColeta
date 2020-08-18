import React, {ChangeEvent, FormEvent, useEffect, useState} from "react";
import './styles.css';
import logo from '../../assets/logo.svg';
import {Link, useHistory} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi';
import {Map, TileLayer, Marker, Popup} from 'react-leaflet';
import {LatLng, LeafletMouseEvent} from "leaflet";
import api from "../../services/api";
import axios from 'axios';
import SuccessWarning from "../../components/SuccessWarning";

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface UF {
    id: number;
    sigla: string;
    nome: string;
}

interface City {
    id: number;
    nome: string
}

const CreatePoint = () => {

    const history = useHistory();
    const [showSuccess, setShowSuccess] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<UF[]>([]);
    const [citys, setCitys] = useState<City[]>([]);
    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedlatlng, setSelectedlatlng] = useState<LatLng | null>(null);
    const [initialLatLng, setInitialLatLng] = useState<LatLng>(new LatLng(-23.3950119, -51.9686101, 15));
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const handleMapClick = (event: LeafletMouseEvent) => {
        console.log(event.latlng)
        setSelectedlatlng(event.latlng);
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            setInitialLatLng(new LatLng(position.coords.latitude, position.coords.longitude));
        })
    }, [])

    useEffect(() => {
        api
            .get('items')
            .then(r => setItems(r.data));
    }, []);

    useEffect(() => {
        axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(r => setUfs(r.data));
    }, [])

    useEffect(() => {
        if (selectedUf === '0')
            return;

        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(r => setCitys(r.data));
    }, [selectedUf]);

    useEffect(() => {
        if(selectedCity === '0')
            return;

        axios.get<{
            features: Array<{
                geometry: {
                    coordinates: Array<number>
                }
            }>
        }>('https://api.opencagedata.com/geocode/v1/geojson', {
            params: {
                q: `${selectedUf}, ${selectedCity}`,
                key: '4641d0e3ac3f4f68b8f66007092f576a',
                countrycode: 'br',
                limit: '1'
            }
        }).then(result => {
            if(selectedlatlng !== null)
                return;
            const [feature] = result.data.features;
            const [long, lat] = feature.geometry.coordinates;
            setInitialLatLng(new LatLng(lat, long, 15));
        });
    }, [selectedCity])

    const handleFormChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setFormData({...formData, [name]: value});
    }

    const handleSelectItem = (id: number) => {
        const alreadySelected = selectedItems.indexOf(id) > -1;

        if (alreadySelected)
            setSelectedItems(selectedItems.filter(x => x !== id));
        else
            setSelectedItems([...selectedItems, id]);
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const data = {
            ...formData,
            uf: selectedUf,
            city: selectedCity,
            latitude: selectedlatlng?.lat,
            longitude: selectedlatlng?.lng,
            items: selectedItems
        }

        await api.post('points', data);
        setShowSuccess(true);
        setTimeout(() => history.goBack(), 1000);
    }

    return (
        <div id="page-create-point">
            {showSuccess && <SuccessWarning />}
            <header>
                <img src={logo} alt="Logo marca"/>
                <Link to="/"><FiArrowLeft/></Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>
                <fieldset>
                    <legend><h2>Dados</h2></legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleFormChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço do mapa</span>
                    </legend>

                    <Map
                        zoom={15}
                        animate
                        center={initialLatLng}
                        onClick={handleMapClick}
                    >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {
                            selectedlatlng && <Marker position={selectedlatlng}/>
                        }
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                value={selectedUf}
                                onChange={(i: ChangeEvent<HTMLSelectElement>) => {
                                    setSelectedUf(i.target.value);
                                }}
                                name="uf"
                                id="uf"
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf.id} value={uf.sigla}>{uf.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select
                                value={selectedCity}
                                onChange={(i: ChangeEvent<HTMLSelectElement>) => {
                                    setSelectedCity(i.target.value);
                                }}
                                name="city"
                                id="city"
                            >
                                <option value="0">Selecione uma cidade</option>
                                {citys.map(city => (
                                    <option key={city.id} value={city.nome}>{city.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li
                                onClick={() => handleSelectItem(item.id)}
                                key={item.id}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt="Teste"/>
                                <span>{item.title}</span>
                            </li>))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint;
