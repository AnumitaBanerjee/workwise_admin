import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import DeleteModal from '../modal/delete-modal';
import { handleDeleteBlog, handleGetBlogList } from '@/utils/services/blog-management';

const BlogManagement = () => {
    const router = useRouter();
    const [blogsList, setBlogsList] = useState([])
    const [limit, setlimit] = useState(10);
    const [page, setpage] = useState(1);
    const [totalPages, settotalPages] = useState(null);
    const [searchString, setSearchString] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [id, setId] = useState();

    const handleClose = () => setShowModal(false);

    const handleBlogUpdate = (item) => {
        router.push(`/blog-management/edit-blog/${item.id}`)
    }

    const handleDeleteItem = (id) => {
        setShowModal(true);
        setId(id);
    };

    const handleSearch = (e) => {
        setSearchString(e.target.value);
    }

    const submitDeleteSection = () => {
        handleDeleteBlog(id)
            .then((res) => {
                handleClose();
                toast(res.message);
                getBlogsList();
            })
            .catch((error) => {
                let txt = "";
                for (let x in error.error.response.data.errors) {
                    txt = error.error.response.data.errors[x];
                }
                toast(txt);
                handleClose();
            });
    }

    const getBlogsList = () => {
        handleGetBlogList(page, limit, searchString)
            .then((res) => {
                settotalPages(Math.ceil(res.total_count / limit));
                setBlogsList(res.data);
            })
            .catch((error) => {
                let txt = "";
                for (let x in error.error.response.data.errors) {
                    txt = error.error.response.data.errors[x];
                }
                toast.error(txt);
            });
    }

    useEffect(() => {
        getBlogsList();
    }, [page, searchString])
    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <h1 className="m-0 text-dark">Blogs List</h1>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            onClick={() =>
                                router.push("/blog-management/add-blog")
                            }
                            className="btn btn-primary mr-2"
                        >
                            <i className="fa fa-plus"></i> Add Blogs
                        </button>
                    </div>
                </div>

                <div className="card card-body product-table mt-3">
                    <div className="row justify-content-end">
                        <div className="col-sm-4 mb-4">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search testimonial"
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    <table className="table table-striped table-hover mb-3">
                        <thead>
                            <tr>
                                <th scope="col">Title</th>
                                <th scope="col">Description</th>
                                <th scope="col">Status</th>
                                <th scope="col">Category</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                blogsList && blogsList?.map((item) => {
                                    return (
                                        <tr key={item.id}>
                                            <td>{item?.title}</td>
                                            <td>{item?.description}</td>
                                            <td>{item?.status === 1 ? 'Active' : 'In-Active'}</td>
                                            <td>{item?.category}</td>
                                            <td className='col-md-2'>
                                                <span
                                                    className="fa fa-edit mr-3"
                                                    onClick={() => handleBlogUpdate(item)}
                                                ></span>
                                                <span
                                                    className="fa fa-trash ml-3"
                                                    onClick={() => handleDeleteItem(item?.id)}
                                                ></span>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                    <nav aria-label="Page navigation example">
                        <ul className="pagination">
                            {Array.from(Array(totalPages), (e, i) => {
                                if (i + 1 === page) {
                                    return (
                                        <li className="active page-item" key={i + 1}>
                                            <a
                                                className="page-link"
                                                href=""
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setpage(i + 1);
                                                }}
                                            >
                                                {i + 1}
                                            </a>
                                        </li>
                                    );
                                } else {
                                    return (
                                        <li className="page-item" key={i + 1}>
                                            <a
                                                className="page-link"
                                                href=""
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setpage(i + 1);
                                                }}
                                            >
                                                {i + 1}
                                            </a>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    </nav>
                </div>
            </section>
            <DeleteModal
                show={showModal}
                onHide={handleClose}
                data={submitDeleteSection}
            />
        </>
    )
}

export default BlogManagement