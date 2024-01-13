import { useState, useEffect } from "react";
import axios from "axios";

const useFetch = (endpoint, query) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exists, setExists] = useState(false);

    const options = {
        method: 'GET',
        url: `https://ezhire.onrender.com/${endpoint}`,
        params: {...query },
    };

    const fetchData = async () =>{
        setIsLoading(true);
        try {
            const response = await axios.request(options);
            setData(response.data.data.data);
            setExists(response.data.exists)
            setIsLoading(false);
        } catch (error) {
            setError(error);
            alert('There is an error')
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const refetch = () =>{
        setIsLoading(true);
        fetchData();
    }

    return { data, isLoading, error, refetch, exists };
}

export default useFetch